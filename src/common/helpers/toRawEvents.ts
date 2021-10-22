import flatten from "lodash/flatten"
import { AnyEvent } from "midifile-ts"
import { DeltaTimeProvider, TickProvider, TrackEvent } from "../track"
import { deassemble as deassembleNote } from "./noteAssembler"

// events in each tracks
export function addDeltaTime<T extends TickProvider>(
  events: T[]
): (T & DeltaTimeProvider)[] {
  let prevTick = 0
  return events
    .sort((a, b) => a.tick - b.tick)
    .map((e) => {
      const newEvent = {
        ...e,
        deltaTime: e.tick - prevTick,
      }
      delete (newEvent as any).tick
      prevTick = e.tick
      return newEvent
    })
}

export function toRawEvents(events: TrackEvent[]): AnyEvent[] {
  const a = flatten(events.map(deassembleNote))
  const c = addDeltaTime(a)
  return c as AnyEvent[]
}
