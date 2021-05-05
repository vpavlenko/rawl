import { IRect } from "../../../common/geometry"

export interface TempoGraphItem {
  id: number
  bounds: IRect
  microsecondsPerBeat: number
}
