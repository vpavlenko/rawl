import { IPoint } from "../geometry"

export class ArrangeCoordTransform {
  private _pixelsPerTick: number
  private _pixelsPerTrack: number

  constructor(pixelsPerTick: number, pixelsPerTrack: number) {
    this._pixelsPerTick = pixelsPerTick
    this._pixelsPerTrack = pixelsPerTrack
  }

  getX(tick: number): number {
    return tick * this._pixelsPerTick
  }

  getY(trackIndex: number): number {
    return trackIndex * this._pixelsPerTrack
  }

  getTick(x: number): number {
    return x / this._pixelsPerTick
  }

  getTrackIndex(y: number): number {
    return y / this._pixelsPerTrack
  }

  getArrangePoint(point: IPoint) {
    return {
      tick: this.getTick(point.x),
      trackIndex: this.getTrackIndex(point.y),
    }
  }

  get pixelsPerTick() {
    return this._pixelsPerTick
  }

  get pixelsPerTrack() {
    return this._pixelsPerTrack
  }
}
