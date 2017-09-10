export default (beats, pixelsPerTick, startTick, endTick) =>
  beats
    .filter(beat => beat.tick >= startTick && beat.tick <= endTick)
    .map(beat => ({
      ...beat,
      x: Math.round(beat.tick * pixelsPerTick)
    }))
