import { observable } from "mobx"
import Theme, { defaultTheme } from "model/Theme"

export default class RootViewStore {
  @observable theme: Theme = defaultTheme
}
