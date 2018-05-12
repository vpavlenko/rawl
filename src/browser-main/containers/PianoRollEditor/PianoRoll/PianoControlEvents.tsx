import React, { StatelessComponent } from "react"
import { controllerTypeString as CCNames } from "helpers/noteNumberString"
import "./PianoControlEvents.css"

interface Event {
  tick: number
  subtype: string
  controllerType?: number
}

function displayControlName(e: Event): string {
  switch (e.subtype) {
    case "controller": {
      const name = CCNames[e.controllerType]
      return name || "Control"
    }
    case "programChange": return "Program Change"
    default: return "Control"
  }
}

interface ControlMarkProps {
  group: Event[]
  pixelsPerTick: number
  onDoubleClick: (e: any) => void
}

const ControlMark: StatelessComponent<ControlMarkProps> = ({
  group,
  pixelsPerTick,
  onDoubleClick
}) => {
  const event = group[0]
  return <div className="ControlMark" style={{ left: event.tick * pixelsPerTick }} onDoubleClick={onDoubleClick}>
    {displayControlName(event)}{group.length > 1 ? ` +${group.length}` : ""}
  </div>
}

/// 重なって表示されないようにひとつのイベントとしてまとめる
function groupControlEvents(events: Event[], tickWindow: number) {
  const groups = []
  let group = []
  for (let e of events) {
    if (group.length === 0) {
      group.push(e)
    } else {
      const startTick = events[0].tick
      if ((e.tick - startTick) < tickWindow) {
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

function isDisplayControlEvent(e: Event): boolean {
  switch (e.subtype) {
    case "controller":
      switch (e.controllerType) {
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
  events: Event[]
  scrollLeft: number
  pixelsPerTick: number
  onDoubleClickMark: (event: any, group: Event[]) => void
}

const PianoControlEvents: StatelessComponent<PianoControlEventsProps> = ({
  width,
  events,
  scrollLeft,
  pixelsPerTick,
  onDoubleClickMark
}) => {
  const eventGroups = groupControlEvents(events.filter(isDisplayControlEvent), 120)

  return <div className="PianoControlEvents" style={{ width }}>
    <div className="inner">
      <div className="content" style={{ left: -scrollLeft }}>
        {eventGroups.map((g, i) => <ControlMark key={i} group={g} pixelsPerTick={pixelsPerTick} onDoubleClick={e => onDoubleClickMark(e, g)} />)}
      </div>
    </div>
  </div>
}

export default PianoControlEvents
