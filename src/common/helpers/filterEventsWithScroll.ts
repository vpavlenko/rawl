export const filterEventsWithRange = <T extends { tick: number }>(
  events: T[],
  tickStart: number,
  tickEnd: number
): T[] => events.filter((e) => e.tick >= tickStart && e.tick <= tickEnd)

export const filterEventsWithScroll = <T extends { tick: number }>(
  events: T[],
  pixelsPerTick: number,
  scrollLeft: number,
  width: number
): T[] =>
  filterEventsWithRange(
    events,
    scrollLeft / pixelsPerTick,
    (scrollLeft + width) / pixelsPerTick
  )
