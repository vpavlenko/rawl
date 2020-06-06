import { observable } from "mobx"

export default class RootViewStore {
  @observable isArrangeViewSelected: boolean = false
  @observable openDrawer = false
}
