import Measure from "./Measure"
import { TIME_BASE } from "../Constants"

class Beat {
  constructor(measure, beat, tick) {
    this.measure = measure
    this.beat = beat
    this.tick = tick
  }
}

export default class MeasureList {
  constructor(conductorTrack, endTick) {
    this.measures = getMeasuresFromConductorTrack(conductorTrack)
    this.beats = createBeats(this.measures, TIME_BASE, endTick)
  }

  getMeasureAt(tick) {
    let lastMeasure = new Measure()
    for (const m of this.measures) {
      if (m.startTick > tick) {
        break
      }
      lastMeasure = m
    }
    return lastMeasure
  }

  getMBTString(tick, ticksPerBeat, formatter = defaultMBTFormatter) {
    return formatter(this.getMBT(tick, ticksPerBeat))
  }

  getMBT(tick, ticksPerBeat) {
    return this.getMeasureAt(tick).getMBT(tick, ticksPerBeat)
  }
}

/**
 * 
 * @param {Track} conductorTrack 
 * @returns {Measure[]}
 */
function getMeasuresFromConductorTrack(conductorTrack) {
  const events = conductorTrack.events
    .filter(e => e.subtype === "timeSignature")

  if (events.length === 0) {
    return [new Measure()]
  } else {
    return events.map((e, i) =>
      new Measure(e.tick, i, e.numerator, e.denominator)
    )
  }
}

function defaultMBTFormatter(mbt) {
  function format(v) {
    return ("   " + v).slice(-4)
  }
  return `${format(mbt.measure + 1)}:${format(mbt.beat + 1)}:${format(mbt.tick)}`
}


/**
 * @returns {Array.<Beat>}
 */
function createBeats(measures, ticksPerBeatBase, endTick) {
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
      beats.push(new Beat(m + Math.floor(beat / measure.numerator), beat % measure.numerator, tick))
    }
    m++
  })
  return beats
}
