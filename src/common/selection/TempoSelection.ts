import { IRect } from "../geometry"
import { TempoCoordTransform } from "../transform"

export interface TempoSelection {
  fromTick: number
  toTick: number
}

export const getTempoSelectionBounds = (
  selection: TempoSelection,
  transform: TempoCoordTransform,
): IRect => {
  const left = transform.getX(selection.fromTick)
  const right = transform.getX(selection.toTick)
  return {
    x: left,
    y: 0,
    width: right - left,
    height: transform.height,
  }
}
