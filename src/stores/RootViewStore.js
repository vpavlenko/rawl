import { extendObservable } from "mobx"

export default class RootViewStore {
  constructor() {
    extendObservable(this, {
      isArrangeViewSelected: false
    })
  }
}
