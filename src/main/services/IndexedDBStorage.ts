export class IndexedDBStorage<Data> {
  private db: IDBDatabase | null = null

  constructor(
    private readonly databaseName: string,
    private readonly storeName: string,
  ) {}

  async list(): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      if (this.db === null) {
        reject()
        return
      }
      const transaction = this.db.transaction([this.storeName], "readonly")
      transaction.oncomplete = () => {
        resolve(request.result.map((key) => key.toString()))
      }
      transaction.onerror = () => {
        reject()
      }
      const objectStore = transaction.objectStore(this.storeName)
      const request = objectStore.getAllKeys()
    })
  }

  async open() {
    return new Promise<void>((resolve, reject) => {
      const request = window.indexedDB.open(this.databaseName, 0)
      request.onerror = () => {
        console.warn("There are no IndexedDB support on this browser")
        reject()
      }
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }
      request.onupgradeneeded = () => {
        const db = request.result
        const objectStore = db.createObjectStore(this.storeName)
        objectStore.createIndex("url", "url", { unique: true })
      }
    })
  }

  async put(data: Data, key: string) {
    return new Promise<void>((resolve, reject) => {
      if (this.db === null) {
        reject()
        return
      }
      const transaction = this.db.transaction([this.storeName], "readwrite")
      transaction.oncomplete = () => {
        resolve()
      }
      transaction.onerror = () => {
        reject()
      }
      const objectStore = transaction.objectStore(this.storeName)
      objectStore.put(data, key)
    })
  }

  async get(key: string) {
    return new Promise<Data>((resolve, reject) => {
      if (this.db === null) {
        reject()
        return
      }
      const transaction = this.db.transaction([this.storeName], "readonly")
      transaction.oncomplete = () => {
        resolve(request.result)
      }
      transaction.onerror = () => {
        reject()
      }
      const objectStore = transaction.objectStore(this.storeName)
      const request = objectStore.get(key) as IDBRequest<Data>
    })
  }
}
