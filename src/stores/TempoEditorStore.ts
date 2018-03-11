import { observable } from "mobx"

export default class TempoEditorStore {
  @observable scrollLeft = 0
  @observable scaleX = 1
  @observable autoScroll = true
}
