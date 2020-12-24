import { AnyEvent } from "midifile-ts"
import { DistributiveOmit } from "../types"

export interface TickProvider {
  tick: number
}

export interface DeltaTimeProvider {
  deltaTime: number
}

export type TrackEventRequired = TickProvider & {
  id: number
}

export type TrackEventOf<T> = DistributiveOmit<T, "deltaTime" | "channel"> &
  TrackEventRequired

type NoteEventContent = {
  type: "channel"
  subtype: "note"
  duration: number
  noteNumber: number
  velocity: number
}

export type NoteEvent = TrackEventOf<NoteEventContent>
export type TrackEvent = TrackEventOf<AnyEvent | NoteEventContent>
