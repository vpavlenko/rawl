import { makeObservable, observable } from "mobx"
import { IRect } from "../../common/geometry"

export default class ArrangeViewStore {
  scaleX = 1
  scaleY = 1
  selection: IRect | null = null // Rect を使うが、x は tick, y はトラック番号を表す
  selectedEventIds: { [key: number]: number[] } = {} // { trackId: [eventId] }
  autoScroll = true
  quantize = 0

  constructor() {
    makeObservable(this, {
      scaleX: observable,
      scaleY: observable,
      selection: observable,
      autoScroll: observable,
      quantize: observable,
    })
  }
}
