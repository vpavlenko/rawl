import { getMeasureAt } from "./MeasureList"
import Measure, { calculateMBT } from "./Measure"

export const getMBTString = (
  measures: Measure[],
  tick: number,
  ticksPerBeat: number,
  formatter = defaultMBTFormatter
): string => formatter(getMBT(measures, tick, ticksPerBeat))

interface Beat {
  measure: number
  beat: number
  tick: number
}

const getMBT = (
  measures: Measure[],
  tick: number,
  ticksPerBeat: number
): Beat => {
  return calculateMBT(getMeasureAt(tick, measures), tick, ticksPerBeat)
}

function defaultMBTFormatter(mbt: Beat): string {
  function format(v: number) {
    return ("   " + v).slice(-4)
  }
  return `${format(mbt.measure + 1)}:${format(mbt.beat + 1)}:${format(
    mbt.tick
  )}`
}
