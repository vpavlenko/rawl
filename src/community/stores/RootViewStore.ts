import { makeObservable, observable } from "mobx"

export default class RootViewStore {
  openSignInDialog = false

  constructor() {
    makeObservable(this, {
      openSignInDialog: observable,
    })
  }
}
