import { observable, computed, action } from "mobx"
import JsonStore from "helpers/electron-json-store"

export default class SettingsStore {
  @observable private _soundFontPath: string | null
  storage = new JsonStore()

  constructor() {
    this._soundFontPath = this.storage.get("soundFontPath")
    console.log(`Setting was restored from ${this.storage.path}`)
  }

  set soundFontPath(path: string | null) {
    this._soundFontPath = path
    this.storage.set("soundFontPath", path)
  }

  @computed get soundFontPath() {
    return this._soundFontPath
  }

  @action clear() {
    this.storage.clear()
    this._soundFontPath = null
  }
}
