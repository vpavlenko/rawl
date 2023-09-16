import styled from "@emotion/styled"
import { FC } from "react"
import { TrackEvent } from "../../../common/track"
import { Layout } from "../../Constants"
import { ControlMark, DisplayEvent } from "./ControlMark"

/// 重なって表示されないようにひとつのイベントとしてまとめる
function groupControlEvents(
  events: DisplayEvent[],
  tickWindow: number,
): DisplayEvent[][] {
  const groups: DisplayEvent[][] = []
  let group: DisplayEvent[] = []
  for (const e of events) {
    if (group.length === 0) {
      group.push(e)
    } else {
      const startTick = events[0].tick
      if (e.tick - startTick < tickWindow) {
        /// 最初のイベントから範囲内ならまとめる
        group.push(e)
      } else {
        /// そうでなければ新しいグループを作る
        groups.push(group)
        group = [e]
      }
    }
  }
  if (group.length > 0) {
    groups.push(group)
  }
  return groups
}

function isDisplayControlEvent(e: TrackEvent): e is DisplayEvent {
  switch ((e as any).subtype) {
    case "controller":
      switch ((e as any).controllerType) {
        case 1: // modulation
        case 7: // volume
        case 10: // panpot
        case 11: // expression
        case 121: // reset all
          return false
        default:
          return true
      }
    case "programChange":
      return true
    default:
      return false
  }
}

export interface PianoControlEventsProps {
  width: number
  events: TrackEvent[]
  scrollLeft: number
  pixelsPerTick: number
  onDoubleClickMark: (group: DisplayEvent[]) => void
}

const Container = styled.div`
  margin-left: ${Layout.keyWidth}px;
  margin-top: ${Layout.rulerHeight}px;
  position: absolute;

  .content {
    position: absolute;
  }
  .innter {
    position: relative;
  }
`

const PianoControlEvents: FC<PianoControlEventsProps> = ({
  width,
  events,
  scrollLeft,
  pixelsPerTick,
  onDoubleClickMark,
}) => {
  const eventGroups = groupControlEvents(
    events.filter(isDisplayControlEvent),
    120,
  )

  return (
    <Container style={{ width }}>
      <div className="inner">
        <div className="content" style={{ left: -scrollLeft }}>
          {eventGroups.map((g, i) => (
            <ControlMark
              key={i}
              group={g}
              pixelsPerTick={pixelsPerTick}
              onDoubleClick={() => onDoubleClickMark(g)}
            />
          ))}
        </div>
      </div>
    </Container>
  )
}

export default PianoControlEvents
