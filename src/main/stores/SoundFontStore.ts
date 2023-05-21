const storeName = "soundfonts"

interface SoundFontData {
  data: ArrayBuffer
  filename: string
}

export class SoundFontStore {
  private db: IDBDatabase | null = null

  private async open() {
    return new Promise<void>((resolve, reject) => {
      const request = window.indexedDB.open("SoundFontStoreDataBase", 0)
      request.onerror = (event) => {
        console.warn("There are no IndexedDB support on this browser")
        reject()
      }
      request.onsuccess = (event) => {
        this.db = request.result
        resolve()
      }
      request.onupgradeneeded = (event) => {
        const db = request.result
        const objectStore = db.createObjectStore(storeName)
        objectStore.createIndex("url", "url", { unique: true })
      }
    })
  }

  private async put(soundFont: SoundFontData) {
    return new Promise<void>((resolve, reject) => {
      if (this.db === null) {
        reject()
        return
      }
      const transaction = this.db.transaction([storeName], "readwrite")
      transaction.oncomplete = () => {
        resolve()
      }
      transaction.onerror = () => {
        reject()
      }
      const objectStore = transaction.objectStore(storeName)
      objectStore.put(soundFont, soundFont.filename)
    })
  }

  private async get(filename: string) {
    return new Promise<SoundFontData>((resolve, reject) => {
      if (this.db === null) {
        reject()
        return
      }
      const transaction = this.db.transaction([storeName], "readonly")
      transaction.oncomplete = () => {
        resolve(request.result)
      }
      transaction.onerror = () => {
        reject()
      }
      const objectStore = transaction.objectStore(storeName)
      const request = objectStore.get(filename) as IDBRequest<SoundFontData>
    })
  }
}
