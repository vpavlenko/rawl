import { makeObservable, observable } from "mobx"
import { makePersistable } from "mobx-persist-store"
import { Language } from "../../common/localize/localizedString"

export default class SettingStore {
  language: Language | null = null

  constructor() {
    makeObservable(this, {
      language: observable,
    })

    makePersistable(this, {
      name: "SettingStore",
      properties: ["language"],
      storage: window.localStorage,
    })
  }
}
