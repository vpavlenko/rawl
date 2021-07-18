export default class Quantizer {
  private timebase: number
  private denominator: number

  constructor(timebase: number, denominator = 8) {
    this.timebase = timebase

    // N 分音符の N
    // n-remnant note n
    this.denominator = denominator
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
    return (this.timebase * 4) / this.denominator
  }
}
