import Measure from "./Measure"
import Track from "common/track"
import { TimeSignatureEvent } from "@signal-app/midifile-ts"

export interface Beat {
  measure: number
  beat: number
  tick: number
}

export default class MeasureList {
  measures: Measure[]

  constructor(conductorTrack: Track) {
    this.measures = getMeasuresFromConductorTrack(conductorTrack)
  }

  getMBTString(
    tick: number,
    ticksPerBeat: number,
    formatter = defaultMBTFormatter
  ): string {
    return formatter(this.getMBT(tick, ticksPerBeat))
  }

  getMBT(tick: number, ticksPerBeat: number): Beat {
    return getMeasureAt(tick, this.measures).getMBT(tick, ticksPerBeat)
  }
}

function getMeasureAt(tick: number, measures: Measure[]): Measure {
  let lastMeasure = new Measure()
  for (const m of measures) {
    if (m.startTick > tick) {
      break
    }
    lastMeasure = m
  }
  return lastMeasure
}

function getMeasuresFromConductorTrack(conductorTrack: Track): Measure[] {
  const events = conductorTrack.findEventsWithSubtype<TimeSignatureEvent>(
    "timeSignature"
  )

  if (events.length === 0) {
    return [new Measure()]
  } else {
    return events.map(
      (e, i) => new Measure(e.tick, i, e.numerator, e.denominator)
    )
  }
}

function defaultMBTFormatter(mbt: Beat): string {
  function format(v: number) {
    return ("   " + v).slice(-4)
  }
  return `${format(mbt.measure + 1)}:${format(mbt.beat + 1)}:${format(
    mbt.tick
  )}`
}
