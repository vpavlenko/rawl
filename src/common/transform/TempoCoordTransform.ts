import { IPoint } from "../geometry"

export default class TempoCoordTransform {
  readonly pixelsPerTick: number
  // グラフの描画領域の高さ
  // Higher graph drawing area
  readonly height: number
  readonly maxBPM: number

  constructor(pixelsPerTick: number, height: number, maxBPM = 320) {
    this.pixelsPerTick = pixelsPerTick
    this.height = height
    this.maxBPM = maxBPM
  }

  getX(tick: number) {
    return tick * this.pixelsPerTick
  }

  getY(bpm: number) {
    return (1 - bpm / this.maxBPM) * this.height // 上下反転
  }

  getMaxY() {
    return this.height
  }

  getTicks(pixels: number) {
    return pixels / this.pixelsPerTick
  }

  getBPM(pixels: number) {
    return (1 - pixels / this.height) * this.maxBPM
  }

  getDeltaBPM(pixels: number) {
    return (-pixels / this.height) * this.maxBPM
  }

  equals(t: TempoCoordTransform) {
    return (
      this.pixelsPerTick === t.pixelsPerTick &&
      this.height === t.height &&
      this.maxBPM === t.maxBPM
    )
  }

  fromPosition(position: IPoint) {
    return {
      tick: this.getTicks(position.x),
      bpm: this.getBPM(position.y),
    }
  }
}
