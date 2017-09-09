export default function maxX(events) {
  return events
    .filter(e => e.subtype === "note")
    .map(n => n.tick + n.duration)
    .reduce((a, b) => Math.max(a, b), 0)
}
