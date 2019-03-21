import { observable } from "mobx"
import Theme, { defaultTheme } from "common/theme"

export default class RootViewStore {
  @observable theme: Theme = defaultTheme
  @observable isArrangeViewSelected: boolean = false
}
