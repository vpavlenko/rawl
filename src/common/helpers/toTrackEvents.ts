import { AnyEvent } from "midifile-ts"
import {
  DeltaTimeProvider,
  isSequencerSpecificEvent,
  TickProvider,
} from "../track"
import { AnySignalEvent, mapToSignalEvent } from "../track/signalEvents"
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

export const isSupportedEvent = (e: AnyEvent): boolean =>
  !(e.type === "meta" && e.subtype === "endOfTrack")

const toSignalEvent = <T extends AnyEvent & TickProvider>(
  e: T
): T | AnySignalEvent => {
  if (isSequencerSpecificEvent(e)) {
    return mapToSignalEvent(e)
  }
  return e
}

export function toTrackEvents(events: AnyEvent[]) {
  return assembleNotes(
    addTick(events.filter(isSupportedEvent)).map(toSignalEvent)
  ).map(removeUnnecessaryProps)
}

// toTrackEvents without addTick
export function tickedEventsToTrackEvents(events: (AnyEvent & TickProvider)[]) {
  return assembleNotes(events.filter(isSupportedEvent).map(toSignalEvent)).map(
    removeUnnecessaryProps
  )
}
