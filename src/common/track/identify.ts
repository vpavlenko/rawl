import {
  ControllerEvent,
  EndOfTrackEvent,
  ProgramChangeEvent,
  SetTempoEvent,
  TimeSignatureEvent,
  TrackNameEvent,
} from "midifile-ts"
import { NoteEvent, TrackEvent, TrackEventRequired } from "./TrackEvent"

export const isNoteEvent = (e: TrackEvent): e is NoteEvent =>
  "subtype" in e && e.subtype === "note"

export const isTrackNameEvent = (
  e: TrackEvent
): e is TrackEventRequired & Omit<TrackNameEvent, "deltaTime"> =>
  "subtype" in e && e.subtype === "trackName"

export const isProgramChangeEvent = (
  e: TrackEvent
): e is TrackEventRequired & Omit<ProgramChangeEvent, "deltaTime"> =>
  "subtype" in e && e.subtype === "programChange"

export const isEndOfTrackEvent = (
  e: TrackEvent
): e is TrackEventRequired & Omit<EndOfTrackEvent, "deltaTime"> =>
  "subtype" in e && e.subtype === "endOfTrack"

export const isSetTempoEvent = (
  e: TrackEvent
): e is TrackEventRequired & Omit<SetTempoEvent, "deltaTime"> =>
  "subtype" in e && e.subtype === "setTempo"

export type TrackTimeSignatureEvent = TrackEventRequired &
  Omit<TimeSignatureEvent, "deltaTime">

export const isTimeSignatureEvent = (
  e: TrackEvent
): e is TrackTimeSignatureEvent =>
  "subtype" in e && e.subtype === "timeSignature"

export const isControllerEvent = (
  e: TrackEvent
): e is TrackEventRequired & Omit<ControllerEvent, "deltaTime"> =>
  "subtype" in e && e.subtype === "controller"
