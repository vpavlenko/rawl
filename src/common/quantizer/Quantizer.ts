type TimeBaseProvider = () => number

export default class Quantizer {
  private timeBaseProvider: TimeBaseProvider
  denominator: number = 4

  constructor(timeBaseProvider: TimeBaseProvider, denominator = 8) {
    this.timeBaseProvider = timeBaseProvider

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
    return (this.timeBaseProvider() * 4) / this.denominator
  }
}
