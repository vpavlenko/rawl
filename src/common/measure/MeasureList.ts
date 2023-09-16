import Track, { isTimeSignatureEvent } from "../track"
import { Measure } from "./Measure"

export function getMeasureAt(tick: number, measures: Measure[]): Measure {
  let lastMeasure: Measure = {
    startTick: 0,
    measure: 0,
    denominator: 4,
    numerator: 4,
  }
  for (const m of measures) {
    if (m.startTick > tick) {
      break
    }
    lastMeasure = m
  }
  return lastMeasure
}

export function getMeasuresFromConductorTrack(
  conductorTrack: Track,
  timebase: number,
): Measure[] {
  const events = conductorTrack.events
    .filter(isTimeSignatureEvent)
    .slice()
    .sort((a, b) => a.tick - b.tick)

  if (events.length === 0) {
    return [
      {
        startTick: 0,
        measure: 0,
        denominator: 4,
        numerator: 4,
      },
    ]
  } else {
    let lastMeasure = 0
    return events.map((e, i) => {
      let measure = 0
      if (i > 0) {
        const lastEvent = events[i - 1]
        const ticksPerBeat = (timebase * 4) / lastEvent.denominator
        const measureDelta = Math.floor(
          (e.tick - lastEvent.tick) / ticksPerBeat / lastEvent.numerator,
        )
        measure = lastMeasure + measureDelta
        lastMeasure = measure
      }
      return {
        startTick: e.tick,
        measure,
        numerator: e.numerator,
        denominator: e.denominator,
      }
    })
  }
}
