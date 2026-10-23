import type { Evidence } from './model'

const DB_NAME = 'allen-engineering-evidence'
const STORE_NAME = 'files'

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) return reject(new Error('This browser does not support local file storage.'))
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Could not open local file storage.'))
  })
}

export async function storeFile(key: string, file: Blob) {
  const db = await openDatabase()
  await new Promise<void>((resolve, reject) => {
    const request = db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).put(file, key)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error ?? new Error('Could not save the file.'))
  })
  db.close()
}

export async function getFile(key: string): Promise<Blob | undefined> {
  const db = await openDatabase()
  const blob = await new Promise<Blob | undefined>((resolve, reject) => {
    const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(key)
    request.onsuccess = () => resolve(request.result as Blob | undefined)
    request.onerror = () => reject(request.error ?? new Error('Could not open the file.'))
  })
  db.close()
  return blob
}

export async function deleteFile(key: string) {
  const db = await openDatabase()
  await new Promise<void>((resolve, reject) => {
    const request = db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).delete(key)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error ?? new Error('Could not remove the file.'))
  })
  db.close()
}

export function metadataBackup(data: Omit<import('./model').WorkspaceData, 'evidence'> & { evidence: Evidence[] }) {
  return {
    format: 'allen-engineering-workspace-metadata',
    version: 1,
    exportedAt: new Date().toISOString(),
    note: 'This backup contains record metadata only. Evidence file contents stored in IndexedDB are not included; download evidence files separately.',
    data,
  }
}
