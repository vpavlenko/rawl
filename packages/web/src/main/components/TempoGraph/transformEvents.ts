import TempoGraphItem from "./TempoGraphItem"
import { SetTempoEvent } from "@signal-app/midifile-ts"
import { TempoCoordTransform } from "common/transform"
import { TrackEvent } from "common/track"
import { CanvasDrawStyle } from "main/style"

const isSetTempoEvent = (e: any): e is TrackEvent & SetTempoEvent =>
  e.subtype == "setTempo"

export default (
  events: TrackEvent[],
  transform: TempoCoordTransform,
  width: number,
  strokeColor: CanvasDrawStyle,
  fillColor: CanvasDrawStyle
): TempoGraphItem[] => {
  // まず位置だけ計算する
  const items = events.filter(isSetTempoEvent).map(e => {
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
