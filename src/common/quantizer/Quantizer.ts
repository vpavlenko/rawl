export default class Quantizer {
  private _ticksPerBeat: number = 480
  denominator: number = 4

  constructor(ticksPerBeat: number, denominator = 8) {
    this._ticksPerBeat = ticksPerBeat

    // N 分音符の N
    // n-remnant note n
    this.denominator = denominator
  }

  set ticksPerBeat(value: number) {
    this._ticksPerBeat = value
  }

  round(tick: number) {
    const u = this.unit
    return Math.round(tick / u) * u
  }

  ceil(tick: number) {
    const u = this.unit
    return Math.ceil(tick / u) * u
  }

  floor(tick: number) {
    const u = this.unit
    return Math.floor(tick / u) * u
  }

  get unit() {
    return (this._ticksPerBeat * 4) / this.denominator
  }
}
