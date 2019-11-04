import { NoteEvent, TrackEvent } from "../track"

export default function filterEventsWithScroll(
  events: TrackEvent[],
  pixelsPerTick: number,
  scrollLeft: number,
  width: number
) {
  const tickStart = scrollLeft / pixelsPerTick
  const tickEnd = (scrollLeft + width) / pixelsPerTick
  function test(tick: number) {
    return tick >= tickStart && tick <= tickEnd
  }
  return events.filter(e =>
    "duration" in e ? test(e.tick + (e.duration || 0)) : test(e.tick)
  )
}
