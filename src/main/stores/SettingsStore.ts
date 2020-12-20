import { makeObservable, observable, reaction } from "mobx"

export interface Settings {
  midiInputIds: string[]
  midiOutputIds: string[]
}

const defaultSettings: Settings = {
  midiInputIds: [],
  midiOutputIds: [],
}

const storeName = "settings"

export default class SettingsStore {
  settings: Settings = defaultSettings
  onInitalized: (settings: Settings) => void
  private db: IDBDatabase | undefined
  private initialized: boolean = false

  constructor(onInitalized: (settings: Settings) => void) {
    this.onInitalized = onInitalized
    this.initialize()

    makeObservable(this, {
      settings: observable.shallow,
    })

    reaction(
      () => this.settings,
      () => {
        if (this.initialized) {
          this.saveToDatabase()
        }
      },
      { delay: 100 }
    )
  }

  update(obj: Partial<Settings>) {
    this.settings = { ...this.settings, ...obj }
  }

  async initialize() {
    try {
      this.db = await openDatabase("db", 1)
      const settings = fromKeyValue(await getAll(this.db, storeName))
      console.log("settings have been loaded", settings)
      await putValues(
        this.db,
        storeName,
        toKeyValue({ ...defaultSettings, ...settings })
      )
      this.settings = settings as Settings
      this.initialized = true
      this.onInitalized(this.settings)
      console.log("default settings have been saved", settings)
    } catch (e) {
      console.error(e)
    }
  }

  async saveToDatabase() {
    if (this.db === undefined) {
      console.error("database is not opened")
      return
    }
    try {
      await putValues(this.db, storeName, toKeyValue(this.settings))
      console.log("settings have been saved", this.settings)
    } catch (e) {
      console.error(e)
    }
  }
}

const openDatabase = async (
  name: string,
  version: number
): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject("IndexedDB is not supported")
      return
    }

    const req = indexedDB.open(name, version)

    req.onupgradeneeded = (e) => {
      const db = req.result
      switch (e.oldVersion) {
        case 0:
          db.createObjectStore(storeName, { keyPath: "key" })
      }
    }

    req.onerror = (e) => reject(e)
    req.onsuccess = () => resolve(req.result)
  })
}

const getAll = async (db: IDBDatabase, storeName: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName)
    const store = transaction.objectStore(storeName)
    const req = store.getAll()
    req.onerror = (e) => reject(e)
    req.onsuccess = () => resolve(req.result)
  })
}

const putValues = async (
  db: IDBDatabase,
  storeName: string,
  values: KeyValue<string, any>[]
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite")
    const store = transaction.objectStore(storeName)
    values.forEach((e) => store.put(e))
    transaction.onerror = () => reject()
    transaction.oncomplete = () => resolve()
  })
}

interface KeyValue<K, S> {
  key: K
  value: S
}

const isKeyValue = <K, S>(object: {}): object is KeyValue<K, S> => {
  return "key" in object && "value" in object
}

const toKeyValue = (object: { [key: string]: any }): KeyValue<string, any>[] =>
  Object.keys(object).map((key) => ({ key, value: object[key] }))

const fromKeyValue = (entries: KeyValue<string, any>[]): {} =>
  Object.fromEntries(entries.filter(isKeyValue).map((e) => [e.key, e.value]))
