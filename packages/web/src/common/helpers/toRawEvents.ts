import { AnyEvent } from "@signal-app/midifile-ts"
import { TrackEvent, TickProvider, DeltaTimeProvider } from "../track"
import { deassemble as deassembleNote } from "./noteAssembler"
import { deassemble as deassembleRPN } from "./RPNAssembler"
import _ from "lodash"

// events in each tracks
export function addDeltaTime<T extends TickProvider>(
  events: T[]
): (T & DeltaTimeProvider)[] {
  let prevTick = 0
  return events
    .sort((a, b) => a.tick - b.tick)
    .map(e => {
      prevTick = e.tick
      const newEvent = {
        ...e,
        deltaTime: e.tick - prevTick
      }
      delete newEvent.tick
      return newEvent
    })
}

export function toRawEvents(events: TrackEvent[]): AnyEvent[] {
  const a = _.flatten(events.map(deassembleNote))
  const b = _.flatten(
    a.map(e => deassembleRPN(e, x => ({ ...x, tick: e.tick })))
  )
  const c = addDeltaTime(b)
  return c as AnyEvent[]
}
