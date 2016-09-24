import Measure from "./Measure"

export default class MeasureList {
  constructor(conductorTrack) {
    this.measures = getMeasuresFromConductorTrack(conductorTrack)
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

function getMeasuresFromConductorTrack(conductorTrack) {
  if (conductorTrack.getEvents().length == 0) {
    return [new Measure]
  } else {
    return conductorTrack.getEvents()
      .filter(e => e.subtype == "timeSignature")
      .map((e, i) => {
        return new Measure(e.tick, i, e.numerator, e.denominator)
      })
  }
}

const defaultMBTFormatter = function(mbt) {
  function format(v) {
    return ("   " + v).slice(-4)
  }
  return `${format(mbt.measure + 1)}:${format(mbt.beat + 1)}:${format(mbt.tick)}`
}
