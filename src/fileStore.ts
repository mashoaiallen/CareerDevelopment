import type { WorkspaceData } from './model'
import { evidenceBucket, publicEvidenceBucket, supabase } from './supabase'

function bucketFor(visibility: 'private' | 'public') {
  return visibility === 'public' ? publicEvidenceBucket : evidenceBucket
}

export async function storeFile(key: string, file: File, visibility: 'private' | 'public') {
  if (!supabase) throw new Error('Private file storage is currently unavailable.')
  const { error } = await supabase.storage.from(bucketFor(visibility)).upload(key, file, {
    contentType: file.type || 'application/octet-stream',
    upsert: false,
  })
  if (error) throw error
}

export async function getFileUrl(key: string, visibility: 'private' | 'public', filename: string, forceDownload = true) {
  if (!supabase) throw new Error('Private file storage is currently unavailable.')
  const bucket = supabase.storage.from(bucketFor(visibility))
  if (visibility === 'public') {
    const { data } = bucket.getPublicUrl(key)
    const url = new URL(data.publicUrl)
    if (forceDownload) url.searchParams.set('download', filename)
    return url.toString()
  }
  const { data, error } = await bucket.createSignedUrl(key, 60 * 10)
  if (error) throw error
  const url = new URL(data.signedUrl)
  if (forceDownload) url.searchParams.set('download', filename)
  return url.toString()
}

export async function deleteFile(key: string, visibility: 'private' | 'public') {
  if (!supabase) throw new Error('Private file storage is currently unavailable.')
  const { error } = await supabase.storage.from(bucketFor(visibility)).remove([key])
  if (error) throw error
}

export function metadataBackup(data: WorkspaceData) {
  return {
    format: 'allen-engineering-workspace-backup',
    version: 2,
    exportedAt: new Date().toISOString(),
    note: 'This backup contains workspace records and evidence metadata. Evidence file contents remain in private file storage and are not embedded in this JSON file.',
    data,
  }
}
