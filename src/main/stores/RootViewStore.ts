import { makeObservable, observable } from "mobx"

export default class RootViewStore {
  isArrangeViewSelected: boolean = false
  openDrawer = false
  openHelp = false
  openDeviceDialog = false

  constructor() {
    makeObservable(this, {
      isArrangeViewSelected: observable,
      openDrawer: observable,
      openHelp: observable,
      openDeviceDialog: observable,
    })
  }
}
