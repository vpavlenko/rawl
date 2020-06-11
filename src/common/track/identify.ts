import { NoteEvent, TrackEvent, TrackEventRequired } from "./TrackEvent"
import {
  TrackNameEvent,
  ProgramChangeEvent,
  EndOfTrackEvent,
  SetTempoEvent,
  ControllerEvent,
  TimeSignatureEvent,
} from "midifile-ts"

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

export const isTimeSignatureEvent = (
  e: TrackEvent
): e is TrackEventRequired & Omit<TimeSignatureEvent, "deltaTime"> =>
  "subtype" in e && e.subtype === "timeSignature"

export const isControllerEvent = (
  e: TrackEvent
): e is TrackEventRequired & Omit<ControllerEvent, "deltaTime"> =>
  "subtype" in e && e.subtype === "controller"
