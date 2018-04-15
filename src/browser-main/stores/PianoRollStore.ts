import { observable } from "mobx"
import SelectionModel from "model/SelectionModel"

export default class PianoRollStore {
  @observable scrollLeft = 0
  @observable scrollTop = 700 // 中央くらいの音程にスクロールしておく
  @observable controlHeight = 0
  @observable cursorPosition = 0
  @observable notesCursor = "auto"
  @observable controlMode = "velocity"
  @observable mouseMode = 0
  @observable scaleX = 1
  @observable scaleY = 1
  @observable autoScroll = true
  @observable quantize = 0
  @observable selection = new SelectionModel()
  @observable lastNoteDuration = null
}
