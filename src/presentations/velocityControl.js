/**

 [{x, y, width, height, selected}, ...]

*/
export default function(events, transform, viewHeight) {
  return events
    .filter(e => e.subtype == "note")
    .map(note => {
      const { x } = transform.getRect(note)
      const width = 5
      const height = note.velocity / 127 * viewHeight
      return {
        selected: note.selected,
        y: viewHeight - height,
        x, width, height
      }
    })
}
