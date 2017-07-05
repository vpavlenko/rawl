import filterEventsWithScroll from "../helpers/filterEventsWithScroll"

/**

  [{ id, x, y, width, height, selected, velocity }, ...]

*/
export default function(events, transform, scrollLeft, width) {
  return filterEventsWithScroll(events, transform, scrollLeft, width)
    .filter(e => e.subtype === "note")
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
