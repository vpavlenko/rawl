export interface Measure {
  startTick: number
  measure: number
  numerator: number
  denominator: number
}

export const calculateMBT = (
  measure: Measure,
  tick: number,
  ticksPerBeatBase: number,
) => {
  const ticksPerBeat = (ticksPerBeatBase * 4) / measure.denominator
  const ticksPerMeasure = ticksPerBeat * measure.numerator

  let aTick = tick - measure.startTick

  const deltaMeasure = Math.floor(aTick / ticksPerMeasure)
  aTick -= deltaMeasure * ticksPerMeasure

  const beat = Math.floor(aTick / ticksPerBeat)
  aTick -= beat * ticksPerBeat

  return {
    measure: measure.measure + deltaMeasure,
    beat: beat,
    tick: aTick,
  }
}
