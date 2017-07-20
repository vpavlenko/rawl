const lineWidth = 2

export default function(events, transform, height) {
  return events
    .filter(e => e.subtype === "pitchBend")
    .map(e => {
      return {
        id: e.id,
        x: Math.round(transform.getX(e.tick)),
        y: Math.round((1 - e.value / 0x4000) * (height - lineWidth * 2)) + lineWidth
      }
    })
}
