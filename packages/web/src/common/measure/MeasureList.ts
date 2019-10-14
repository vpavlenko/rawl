import Measure from "./Measure"
import Track from "common/track"
import { TimeSignatureEvent } from "@signal-app/midifile-ts"

export function getMeasureAt(tick: number, measures: Measure[]): Measure {
  let lastMeasure: Measure = {
    startTick: 0,
    measure: 0,
    denominator: 4,
    numerator: 4
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
  conductorTrack: Track
): Measure[] {
  const events = conductorTrack.findEventsWithSubtype<TimeSignatureEvent>(
    "timeSignature"
  )

  if (events.length === 0) {
    return [
      {
        startTick: 0,
        measure: 0,
        denominator: 4,
        numerator: 4
      }
    ]
  } else {
    return events.map((e, i) => ({
      startTick: e.tick,
      measure: i,
      numerator: e.numerator,
      denominator: e.denominator
    }))
  }
}
