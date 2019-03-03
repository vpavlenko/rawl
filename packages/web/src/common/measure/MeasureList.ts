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
  beats: Beat[]

  constructor(conductorTrack: Track, endTick: number, timeBase: number) {
    this.measures = getMeasuresFromConductorTrack(conductorTrack)
    this.beats = createBeats(this.measures, timeBase, endTick)
  }

  getMeasureAt(tick: number): Measure {
    let lastMeasure = new Measure()
    for (const m of this.measures) {
      if (m.startTick > tick) {
        break
      }
      lastMeasure = m
    }
    return lastMeasure
  }

  getMBTString(tick: number, ticksPerBeat: number, formatter = defaultMBTFormatter): string {
    return formatter(this.getMBT(tick, ticksPerBeat))
  }

  getMBT(tick: number, ticksPerBeat: number): Beat {
    return this.getMeasureAt(tick).getMBT(tick, ticksPerBeat)
  }
}

function getMeasuresFromConductorTrack(conductorTrack: Track): Measure[] {
  const events = conductorTrack.findEventsWithSubtype<TimeSignatureEvent>("timeSignature")

  if (events.length === 0) {
    return [new Measure()]
  } else {
    return events.map((e, i) =>
      new Measure(e.tick, i, e.numerator, e.denominator)
    )
  }
}

function defaultMBTFormatter(mbt: Beat): string {
  function format(v) {
    return ("   " + v).slice(-4)
  }
  return `${format(mbt.measure + 1)}:${format(mbt.beat + 1)}:${format(mbt.tick)}`
}

function createBeats(measures: Measure[], ticksPerBeatBase: number, endTick: number): Beat[] {
  const beats = []
  let m = 0
  measures.forEach((measure, i) => {
    const ticksPerBeat = ticksPerBeatBase * 4 / measure.denominator

    // 次の小節か曲の最後まで拍を作る
    const nextMeasure = measures[i + 1]
    const lastTick = nextMeasure ? nextMeasure.startTick : endTick
    let endBeat = (lastTick - measure.startTick) / ticksPerBeat

    for (let beat = 0; beat < endBeat; beat++) {
      const tick = measure.startTick + ticksPerBeat * beat
      beats.push({
        measure: m + Math.floor(beat / measure.numerator), 
        beat: beat % measure.numerator, 
        tick
      })
    }
    m++
  })
  return beats
}
