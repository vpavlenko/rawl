export default function filterEventsWithScroll(events, pixelsPerTick, scrollLeft, width) {
  const tickStart = scrollLeft / pixelsPerTick
  const tickEnd = (scrollLeft + width) / pixelsPerTick
  function test(tick) {
    return tick >= tickStart && tick <= tickEnd
  }
  return events.filter(e => test(e.tick) || test(e.tick + (e.duration || 0)))
}
