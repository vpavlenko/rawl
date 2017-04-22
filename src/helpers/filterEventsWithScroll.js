export default function filterEventsWithScroll(events, transform, scrollLeft, width) {
  const tickStart = transform.getTicks(scrollLeft)
  const tickEnd = transform.getTicks(scrollLeft + width)
  function test(tick) {
    return tick >= tickStart && tick <= tickEnd
  }
  return events.filter(e => test(e.tick) || test(e.tick + e.duration))
}
