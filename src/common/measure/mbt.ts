import { calculateMBT, Measure } from "./Measure"
import { getMeasureAt } from "./MeasureList"

export const getMBTString = (
  measures: Measure[],
  tick: number,
  ticksPerBeat: number,
  formatter = defaultMBTFormatter,
): string => formatter(getMBT(measures, tick, ticksPerBeat))

interface Beat {
  measure: number
  beat: number
  tick: number
}

const getMBT = (
  measures: Measure[],
  tick: number,
  ticksPerBeat: number,
): Beat => {
  return calculateMBT(getMeasureAt(tick, measures), tick, ticksPerBeat)
}

const pad = (v: number, digit: number) => {
  const str = v.toString(10)
  return ("0".repeat(digit) + str).slice(-Math.max(digit, str.length))
}

function defaultMBTFormatter(mbt: Beat): string {
  return `${pad(mbt.measure + 1, 4)}:${pad(mbt.beat + 1, 2)}:${pad(
    mbt.tick,
    3,
  )}`
}
