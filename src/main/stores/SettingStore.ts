import { makeObservable, observable } from "mobx"
import { Language } from "../../common/localize/localizedString"

export default class SettingStore {
  language: Language | null = "ja"

  constructor() {
    makeObservable(this, {
      language: observable,
    })

    // makePersistable(this, {
    //   name: "SettingStore",
    //   properties: ["language"],
    //   storage: window.localStorage,
    // })
  }
}
