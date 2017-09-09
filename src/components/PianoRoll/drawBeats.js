export default function drawBeats(beats, pixelsPerTick, startTick, endTick, draw) {
  for (let beat of beats) {
    if (beat.tick < startTick) {
      continue
    } else if (beat.tick > endTick) {
      break
    }
  
    const x = Math.round(beat.tick * pixelsPerTick)
    draw(beat, x)
  }
}
