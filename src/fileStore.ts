import type { WorkspaceData } from './model'
import { evidenceBucket, supabase } from './supabase'

export async function storeFile(key: string, file: File) {
  if (!supabase) throw new Error('Private file storage is currently unavailable.')
  const { error } = await supabase.storage.from(evidenceBucket).upload(key, file, {
    contentType: file.type || 'application/octet-stream',
    upsert: false,
  })
  if (error) throw error
}

export async function getFileUrl(key: string) {
  if (!supabase) throw new Error('Private file storage is currently unavailable.')
  const { data, error } = await supabase.storage.from(evidenceBucket).createSignedUrl(key, 60 * 10)
  if (error) throw error
  return data.signedUrl
}

export async function deleteFile(key: string) {
  if (!supabase) throw new Error('Private file storage is currently unavailable.')
  const { error } = await supabase.storage.from(evidenceBucket).remove([key])
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
