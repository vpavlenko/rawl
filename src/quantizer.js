"use strict"
class Quantizer {
  constructor(pixelsPerBeat, pixelsPerKey) {
    this.pixelsPerBeat = pixelsPerBeat
    this.pixelsPerKey = pixelsPerKey

    // N 分音符の N
    this.denominator = 4
  }

  roundX(x) {
    var u = this.unitX
    return Math.round(x / u) * u
  }

  roundY(y) {
    var u = this.unitY
    return Math.round(y / u) * u
  }

  ceilX(x) {
    var u = this.unitX
    return Math.ceil(x / u) * u
  }

  ceilY(y) {
    var u = this.unitY
    return Math.ceil(y / u) * u
  }

  floorX(x) {
    var u = this.unitX
    return Math.floor(x / u) * u
  }

  floorY(y) {
    var u = this.unitY
    return Math.floor(y / u) * u
  }

  get unitX() {
    return this.pixelsPerBeat * 4 / this.denominator
  }

  get unitY() {
    return this.pixelsPerKey
  }
}

