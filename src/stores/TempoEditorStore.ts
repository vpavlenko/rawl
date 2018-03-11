import { observable } from "mobx"

export default class TempoEditorStore {
  @observable scrollLeft: number = 0
  @observable scaleX: number = 1
  @observable autoScroll: boolean = true
}
