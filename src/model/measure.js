export default class Measure {
  constructor(startTick = 0, measure = 0, numerator = 4, denominator = 4) {
    this.startTick = startTick
    this.measure = measure
    this.numerator = numerator
    this.denominator = denominator
  }

  getMBT(tick, ticksPerBeatBase) {
    const ticksPerBeat = ticksPerBeatBase * 4 / this.denominator
    const ticksPerMeasure = ticksPerBeat * this.numerator

    let aTick = tick - this.startTick

    const measure = Math.floor(aTick / ticksPerMeasure)
    aTick -= measure * ticksPerMeasure

    const beat = Math.floor(aTick / ticksPerBeat)
    aTick -= beat * ticksPerBeat

    return {
      measure: this.measure + measure,
      beat: beat,
      tick: aTick
    }
  }
}
