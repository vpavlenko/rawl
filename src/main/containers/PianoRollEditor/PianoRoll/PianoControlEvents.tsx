import React, { StatelessComponent } from "react"
import { controllerTypeString as CCNames } from "helpers/noteNumberString"
import { TrackEvent } from "common/track"
import "./PianoControlEvents.css"
import { ControllerEvent, ProgramChangeEvent } from "@signal-app/midifile-ts";

type DisplayEvent = TrackEvent & (ControllerEvent | ProgramChangeEvent)

function displayControlName(e: DisplayEvent): string {
  switch (e.subtype) {
    case "controller": {
      const name = CCNames[(e as ControllerEvent).controllerType]
      return name || "Control"
    }
    case "programChange": return "Program Change"
    default: return "Control"
  }
}

interface ControlMarkProps {
  group: DisplayEvent[]
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
function groupControlEvents(events: DisplayEvent[], tickWindow: number): DisplayEvent[][] {
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
  onDoubleClickMark: (event: any, group: DisplayEvent[]) => void
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
