import { ItemValue } from "../../main/components/ControlPane/Graph/LineGraphControl"
import { IPoint, IRect } from "../geometry"
import { ControlSelection } from "../selection/ControlSelection"

export class ControlCoordTransform {
  private _maxValue: number
  private _height: number
  private _lineWidth: number
  private _pixelsPerTick: number

  constructor(
    pixelsPerTick: number,
    maxValue: number,
    height: number,
    lineWidth: number
  ) {
    this._pixelsPerTick = pixelsPerTick
    this._maxValue = maxValue
    this._height = height
    this._lineWidth = lineWidth
  }

  get maxValue() {
    return this._maxValue
  }

  getX(tick: number) {
    return tick * this._pixelsPerTick
  }

  getTicks(pixels: number) {
    return pixels / this._pixelsPerTick
  }

  toPosition(tick: number, value: number): IPoint {
    return {
      x: Math.round(this.getX(tick)),
      y:
        Math.round(
          (1 - value / this._maxValue) * (this._height - this._lineWidth * 2)
        ) + this._lineWidth,
    }
  }

  fromPosition(position: IPoint): ItemValue {
    return {
      tick: this.getTicks(position.x),
      value:
        (1 -
          (position.y - this._lineWidth) /
            (this._height - this._lineWidth * 2)) *
        this._maxValue,
    }
  }

  transformSelection(selection: ControlSelection): IRect {
    const x = this.getX(selection.fromTick)
    return {
      x,
      y: 0,
      width: this.getX(selection.toTick) - x,
      height: this._height,
    }
  }
}
