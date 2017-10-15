export default function(events, transform, width, scrollLeft) {

  // まず位置だけ計算する
  const items = events
    .filter(e => e.subtype === "setTempo")
    .map(e => {
      const bpm = 60 * 1000000 / e.microsecondsPerBeat
      return {
        id: e.id,
        x: Math.round(transform.getX(e.tick)),
        y: Math.round(transform.getY(bpm))
      }
    })

  // 次のイベント位置まで延びるように大きさを設定する
  return items
    .map((e, i) => {
      const nextItem = (i + 1 < items.length && items[i + 1]) || {
        x: width,
        y: 0
      }

      return {
        ...e,
        x: e.x - scrollLeft,
        width: nextItem.x - e.x,
        height: transform.height - e.y
      }
    })
    .filter(e => e.x + e.width >= 0)
}
