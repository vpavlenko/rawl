import _ from "lodash"
import { assemble as assembleNotes } from "./noteAssembler"
import { assemble as assembleRPN } from "./RPNAssembler"
import { AnyEvent } from "midifile-ts"
import { DeltaTimeProvider, TickProvider } from "common/track"

function addTick<T extends DeltaTimeProvider>(
  events: T[]
): (T & TickProvider)[] {
  let tick = 0
  return events.map(e => {
    tick += e.deltaTime
    const newEvent = {
      ...e,
      tick
    }
    return newEvent
  })
}

export function toTrackEvents(events: AnyEvent[]) {
  return assembleNotes(addTick(assembleRPN(events)))
}
