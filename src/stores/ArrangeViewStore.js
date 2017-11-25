import { observable } from "mobx"

export default class ArrangeViewStore {
  @observable scrollLeft = 0
  @observable scrollTop = 0
  @observable scaleX = 1
  @observable scaleY = 1
  @observable selection = null // Rect を使うが、x は tick, y はトラック番号を表す
  selectedEventIds = {} // { trackId: [eventId] }
  @observable autoScroll = true
  @observable quantize = 0
}
