import { SetTempoEvent } from "midifile-ts"
import { TrackEvent } from "../../../common/track"
import { TempoCoordTransform } from "../../../common/transform"
import { TempoGraphItem } from "./TempoGraphItem"

const isSetTempoEvent = (e: any): e is TrackEvent & SetTempoEvent =>
  e.subtype == "setTempo"

export const transformEvents = (
  events: TrackEvent[],
  transform: TempoCoordTransform,
  width: number
): TempoGraphItem[] => {
  // まず位置だけ計算する
  const items = events.filter(isSetTempoEvent).map((e) => {
    const bpm = (60 * 1000000) / e.microsecondsPerBeat
    return {
      id: e.id,
      x: Math.round(transform.getX(e.tick)),
      y: Math.round(transform.getY(bpm)),
      microsecondsPerBeat: e.microsecondsPerBeat,
    }
  })

  // 次のイベント位置まで延びるように大きさを設定する
  return items.map((e, i) => {
    const nextItem = (i + 1 < items.length && items[i + 1]) || {
      x: width,
      y: 0,
    }
    return {
      id: e.id,
      bounds: {
        x: e.x,
        y: e.y,
        width: nextItem.x - e.x,
        height: transform.height - e.y + 1, // fit to screen bottom
      },
      microsecondsPerBeat: e.microsecondsPerBeat,
    }
  })
}
