export type Range = [start: number, end: number]

const getRange = (
  pixelsPerTick: number,
  scrollLeft: number,
  width: number,
): Range => [scrollLeft / pixelsPerTick, (scrollLeft + width) / pixelsPerTick]

export const filterEventsWithRange = <T extends { tick: number }>(
  events: T[],
  ...range: Range
): T[] => events.filter((e) => e.tick >= range[0] && e.tick < range[1])

export const filterEventsWithScroll = <T extends { tick: number }>(
  events: T[],
  pixelsPerTick: number,
  scrollLeft: number,
  width: number,
): T[] =>
  filterEventsWithRange(events, ...getRange(pixelsPerTick, scrollLeft, width))

export const filterEventsOverlapRange = <
  T extends { tick: number; duration?: number },
>(
  events: T[],
  ...range: Range
): T[] => {
  return events.filter((e) => {
    if ("duration" in e && typeof e.duration === "number") {
      const eventTickEnd = e.tick + e.duration
      return e.tick < range[1] && eventTickEnd > range[0]
    }
    return e.tick >= range[0] && e.tick < range[1]
  })
}

export const filterEventsOverlapScroll = <
  T extends { tick: number; duration?: number },
>(
  events: T[],
  pixelsPerTick: number,
  scrollLeft: number,
  width: number,
): T[] => {
  return filterEventsOverlapRange(
    events,
    ...getRange(pixelsPerTick, scrollLeft, width),
  )
}
