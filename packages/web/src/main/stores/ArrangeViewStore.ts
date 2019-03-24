import { observable } from "mobx"
import { IRect } from "common/geometry"

export default class ArrangeViewStore {
  @observable scrollLeft = 0
  @observable scrollTop = 0
  @observable scaleX = 1
  @observable scaleY = 1
  @observable selection: IRect | null = null // Rect を使うが、x は tick, y はトラック番号を表す
  selectedEventIds: { [key: number]: number[] } = {} // { trackId: [eventId] }
  @observable autoScroll = true
  @observable quantize = 0
}
