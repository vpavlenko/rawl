import maxBy from "lodash/maxBy"
import { isTimeSignatureEvent } from "../track"
import Song from "./Song"

export const getMeasureStart = (song: Song, tick: number) => {
  if (song.conductorTrack === undefined) {
    return null
  }

  // get the nearest time signature
  const timeSignature = maxBy(
    song.conductorTrack.events
      .filter(isTimeSignatureEvent)
      .slice()
      .filter((e) => e.tick <= tick),
    (e) => e.tick,
  )

  if (timeSignature === undefined) {
    return null
  }

  // calculate the nearest measure beginning
  const ticksPerMeasure =
    ((song.timebase * 4) / timeSignature.denominator) * timeSignature.numerator
  const numberOfMeasures = Math.floor(
    (tick - timeSignature.tick) / ticksPerMeasure,
  )

  return {
    tick: timeSignature.tick + numberOfMeasures * ticksPerMeasure,
    timeSignature,
  }
}
