export default function maxX(events) {
  return Math.max.apply(null,
    events
      .filter(e => e.subtype === "note")
      .map(n => n.tick + n.duration)
  )
}
