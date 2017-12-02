import { observable } from "mobx"
import Theme from "model/Theme"

export default class RootViewStore {
  @observable theme = new Theme()
}
