import { observable, computed } from "mobx"
const Store = window.require("electron-store")
const storage = new Store()

console.log(`Setting was restored from ${storage.path}`)

export default class SettingsStore {
  @observable _soundFontPath = storage.get("soundFontPath")

  set soundFontPath(path) {
    this._soundFontPath = path
    storage.set("soundFontPath", path)
  }

  @computed get soundFontPath() {
    return this._soundFontPath
  }
}
