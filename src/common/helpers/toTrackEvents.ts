import { AnyEvent } from "midifile-ts"
import { DeltaTimeProvider, TickProvider } from "../track"
import { assemble as assembleNotes } from "./noteAssembler"

export function addTick<T extends DeltaTimeProvider>(
  events: T[]
): (T & TickProvider)[] {
  let tick = 0
  return events.map((e) => {
    tick += e.deltaTime
    const newEvent = {
      ...e,
      tick,
    }
    delete (newEvent as any).deltaTime
    return newEvent
  })
}

export const removeUnnecessaryProps = <T>(e: T): T => {
  const { channel, ...ev } = e as any
  return ev
}

export function toTrackEvents(events: AnyEvent[]) {
  return assembleNotes(addTick(events)).map(removeUnnecessaryProps)
}
