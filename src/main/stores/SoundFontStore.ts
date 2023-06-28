import { makeObservable, observable } from "mobx"
import { SoundFontSynth } from "../services/SoundFontSynth"

const storeName = "soundfonts"

interface SoundFontData {
  data: ArrayBuffer
  filename: string
}

export class SoundFontStore {
  private db: IDBDatabase | null = null
  filenames: string[] = []

  constructor(private readonly synth: SoundFontSynth) {
    makeObservable(this, {
      filenames: observable,
      // TODO: add user selected soundfont and persist it
    })

    this.open()
  }

  async list(): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      if (this.db === null) {
        reject()
        return
      }
      const transaction = this.db.transaction([storeName], "readonly")
      transaction.oncomplete = () => {
        resolve(request.result.map((key) => key.toString()))
      }
      transaction.onerror = () => {
        reject()
      }
      const objectStore = transaction.objectStore(storeName)
      const request = objectStore.getAllKeys()
    })
  }

  async load(filename: string) {
    const soundfont = await this.get(filename)
    await this.synth.loadSoundFont(soundfont.data)
  }

  private async open() {
    return new Promise<void>((resolve, reject) => {
      const request = window.indexedDB.open("SoundFontStoreDataBase", 0)
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
        const objectStore = db.createObjectStore(storeName)
        objectStore.createIndex("url", "url", { unique: true })
      }
    })
  }

  async put(soundFont: SoundFontData) {
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
