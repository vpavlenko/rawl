class Quantizer {
  constructor(pixelsPerBeat, pixelsPerKey) {
    this.pixelsPerBeat = pixelsPerBeat
    this.pixelsPerKey = pixelsPerKey

    // N 分音符の N
    this.denominator = 4
  }

  quantizeX(x) {
    var u = this.pixelsPerBeat * 4 / this.denominator
    return Math.round(x / u) * u
  }

  quantizeY(y) {
    var u = this.pixelsPerKey
    return Math.round(y / u) * u
  }
}

