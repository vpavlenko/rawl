/**

  [{ id, x, y, width, height, selected, velocity }, ...]

*/
export default function(events, transform) {
  return events
    .filter(e => e.subtype == "note")
    .map(note => {
      const rect = transform.getRect(note)
      return {
        id: note.id,
        velocity: note.velocity,
        selected: note.selected,
        ...rect,
      }
    })
}
