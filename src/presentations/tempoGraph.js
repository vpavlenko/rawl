const MAX_BPM = 512

export default function(events, pixelsPerTick, width, height) {

  // まず位置だけ計算する
  const items = events
    .filter(e => e.subtype == "setTempo")
    .map(e => {
      const bpm = 60 * 1000000 / e.microsecondsPerBeat
      return {
        id: e.id,
        x: e.tick * pixelsPerTick,
        y: (MAX_BPM - bpm) * (height / MAX_BPM) // 上下反転
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
        width: nextItem.x - e.x,
        height: height - e.y
      }
    })
}
