import { NoteEvent, TrackEvent, isNoteEvent } from "../track"

export default function filterNoteEventsWithScroll(
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

  return events.filter((e) =>
    isNoteEvent(e) ? test(e.tick + (e.duration || 0)) : test(e.tick)
  )
}

export function filterEventsWithScroll(
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

  return events.filter((e) => test(e.tick))
}
