import TempoGraphItem from "./TempoGraphItem"

export default (
  events,
  transform,
  width,
  strokeColor,
  fillColor
): TempoGraphItem[] => {
  // まず位置だけ計算する
  const items = events
    .filter(e => e.subtype === "setTempo")
    .map(e => {
      const bpm = (60 * 1000000) / e.microsecondsPerBeat
      return {
        id: e.id,
        x: Math.round(transform.getX(e.tick)),
        y: Math.round(transform.getY(bpm))
      }
    })

  // 次のイベント位置まで延びるように大きさを設定する
  return items.map((e, i) => {
    const nextItem = (i + 1 < items.length && items[i + 1]) || {
      x: width,
      y: 0
    }
    return new TempoGraphItem(
      e.id,
      e.x,
      e.y,
      nextItem.x - e.x,
      transform.height,
      fillColor,
      strokeColor
    )
  })
}
