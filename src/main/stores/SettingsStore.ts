import { action, computed, makeObservable, observable } from "mobx"
import JsonStore from "../helpers/electron-json-store"

export default class SettingsStore {
  private _soundFontPath: string | null
  storage = new JsonStore()

  constructor() {
    makeObservable<SettingsStore, "_soundFontPath">(this, {
      _soundFontPath: observable,
      soundFontPath: computed,
      clear: action,
    })

    this._soundFontPath = this.storage.get("soundFontPath")
    console.log(`Setting was restored from ${this.storage.path}`)
  }

  set soundFontPath(path: string | null) {
    this._soundFontPath = path
    this.storage.set("soundFontPath", path)
  }

  get soundFontPath() {
    return this._soundFontPath
  }

  clear() {
    this.storage.clear()
    this._soundFontPath = null
  }
}
