export default class TempoCoordTransform {
  pixelsPerTick: number
  // グラフの描画領域の高さ
  height: number
  maxBPM: number

  constructor(pixelsPerTick, height, maxBPM = 320) {
    this.pixelsPerTick = pixelsPerTick
    this.height = height
    this.maxBPM = maxBPM
  }

  getX(tick) {
    return tick * this.pixelsPerTick
  }

  getY(bpm) {
    return (1 - bpm / this.maxBPM) * this.height // 上下反転
  }

  getMaxY() {
    return this.height
  }

  getTicks(pixels) {
    return pixels / this.pixelsPerTick
  }

  getBPM(pixels) {
    return (1 - pixels / this.height) * this.maxBPM
  }

  getDeltaBPM(pixels) {
    return -pixels / this.height * this.maxBPM
  }

  equals(t) {
    return this.pixelsPerTick === t.pixelsPerTick
      && this.height === t.height
      && this.maxBPM === t.maxBPM
  }
}
