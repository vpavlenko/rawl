export interface Metadata {
  id: number
  name: string
}

export class IndexedDBStorage<Data extends Metadata> {
  private db: IDBDatabase | null = null

  constructor(
    private readonly dbName: string,
    private readonly version: number,
  ) {}

  async init() {
    this.db = await this.openDatabase()
  }

  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const openDBRequest = indexedDB.open(this.dbName, this.version)
      openDBRequest.onsuccess = () => resolve(openDBRequest.result)
      openDBRequest.onupgradeneeded = (event) => {
        const db = openDBRequest.result
        if (!db.objectStoreNames.contains("files")) {
          db.createObjectStore("files", { keyPath: "id", autoIncrement: true })
        }
      }
      openDBRequest.onerror = () => reject(openDBRequest.error)
    })
  }

  async save(data: Data, name: string): Promise<number> {
    if (!this.db) throw new Error("Database not initialized")
    const transaction = this.db.transaction("files", "readwrite")
    const store = transaction.objectStore("files")
    const request = store.add({ data, name })
    const result = await this.requestToPromise<IDBValidKey>(request)
    return result as number
  }

  async load(id: number): Promise<Data | null> {
    if (!this.db) throw new Error("Database not initialized")
    const transaction = this.db.transaction("files", "readonly")
    const store = transaction.objectStore("files")
    const request = store.get(id)
    const result = await this.requestToPromise<{ data: Data }>(request)
    return result ? result.data : null
  }

  async delete(id: number): Promise<void> {
    if (!this.db) throw new Error("Database not initialized")
    const transaction = this.db.transaction("files", "readwrite")
    const store = transaction.objectStore("files")
    store.delete(id)
  }

  async list(): Promise<Metadata[]> {
    if (!this.db) throw new Error("Database not initialized")
    const transaction = this.db.transaction("files", "readonly")
    const store = transaction.objectStore("files")

    return new Promise<Metadata[]>((resolve, reject) => {
      const request = store.openCursor()
      const results: Metadata[] = []

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
        if (cursor) {
          results.push({ id: cursor.key as number, name: cursor.value.name })
          cursor.continue()
        } else {
          resolve(results)
        }
      }

      request.onerror = () => reject(request.error)
    })
  }

  private requestToPromise<T>(request: IDBRequest): Promise<T> {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }
}
