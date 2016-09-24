export default class Quantizer {
  constructor(ticksPerBeat) {
    this._ticksPerBeat = ticksPerBeat

    // N 分音符の N
    this.denominator = 4
  }

  round(tick) {
    var u = this.unit
    return Math.round(tick / u) * u
  }

  ceil(tick) {
    var u = this.unit
    return Math.ceil(tick / u) * u
  }

  floor(tick) {
    var u = this.unit
    return Math.floor(tick / u) * u
  }

  get unit() {
    return this._ticksPerBeat * 4 / this.denominator
  }

}
