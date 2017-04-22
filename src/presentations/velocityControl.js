import filterEventsWithScroll from "../helpers/filterEventsWithScroll"

/**

 [{x, y, width, height, selected}, ...]

*/
export default function(events, transform, scrollLeft, width, viewHeight) {
  return filterEventsWithScroll(events, transform, scrollLeft, width)
    .filter(e => e.subtype == "note")
    .map(note => {
      const { x } = transform.getRect(note)
      const width = 5
      const height = note.velocity / 127 * viewHeight
      return {
        id: note.id,
        velocity: note.velocity,
        selected: note.selected,
        y: viewHeight - height,
        x, width, height
      }
    })
}
