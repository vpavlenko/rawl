import { Beat } from "common/measure"

export interface BeatWithX extends Beat {
  x: number
}

export default (
  beats: Beat[],
  pixelsPerTick: number,
  startTick: number,
  endTick: number
): BeatWithX[] =>
  beats
    .filter(beat => beat.tick >= startTick && beat.tick <= endTick)
    .map(beat => ({
      ...beat,
      x: Math.round(beat.tick * pixelsPerTick)
    }))
