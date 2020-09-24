import { TrackEvent } from "../track"

export function filterEventsWithScroll<T extends TrackEvent>(
  events: T[],
  pixelsPerTick: number,
  scrollLeft: number,
  width: number
): T[] {
  const tickStart = scrollLeft / pixelsPerTick
  const tickEnd = (scrollLeft + width) / pixelsPerTick
  function test(tick: number) {
    return tick >= tickStart && tick <= tickEnd
  }

  return events.filter((e) => test(e.tick))
}
