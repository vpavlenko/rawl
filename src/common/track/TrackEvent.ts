import {
  ChannelEvent,
  TextEvent,
  SequenceNumberEvent,
  CopyrightNoticeEvent,
  TrackNameEvent,
  InstrumentNameEvent,
  LyricsEvent,
  MarkerEvent,
  CuePointEvent,
  ChannelPrefixEvent,
  PortPrefixEvent,
  EndOfTrackEvent,
  SetTempoEvent,
  SmpteOffsetEvent,
  TimeSignatureEvent,
  KeySignatureEvent,
  SequencerSpecificEvent,
  UnknownMetaEvent,
  NoteOffEvent,
  NoteOnEvent,
  NoteAftertouchEvent,
  ProgramChangeEvent,
  ChannelAftertouchEvent,
  PitchBendEvent,
  UnknownChannelEvent,
  ControllerEvent,
  SysExEvent,
  DividedSysExEvent,
} from "midifile-ts"
import { RPNEvent } from "../helpers/RPNAssembler"

export interface TickProvider {
  tick: number
}

export interface DeltaTimeProvider {
  deltaTime: number
}

export type TrackEventRequired = TickProvider & {
  id: number
}

export const isNoteEvent = (e: any): e is NoteEvent =>
  "subtype" in e && e.subtype === "note"

export type NoteEvent = TrackEventRequired &
  Omit<ChannelEvent<"note">, "deltaTime" | "channel"> & {
    duration: number
    noteNumber: number
    velocity: number
  }

export type TrackMidiEvent =
  | Omit<RPNEvent, "deltaTime" | "channel">
  | Omit<SequenceNumberEvent, "deltaTime">
  | Omit<TextEvent, "deltaTime">
  | Omit<CopyrightNoticeEvent, "deltaTime">
  | Omit<TrackNameEvent, "deltaTime">
  | Omit<InstrumentNameEvent, "deltaTime">
  | Omit<LyricsEvent, "deltaTime">
  | Omit<MarkerEvent, "deltaTime">
  | Omit<CuePointEvent, "deltaTime">
  | Omit<ChannelPrefixEvent, "deltaTime" | "channel">
  | Omit<PortPrefixEvent, "deltaTime">
  | Omit<EndOfTrackEvent, "deltaTime">
  | Omit<SetTempoEvent, "deltaTime">
  | Omit<SmpteOffsetEvent, "deltaTime">
  | Omit<TimeSignatureEvent, "deltaTime">
  | Omit<KeySignatureEvent, "deltaTime">
  | Omit<SequencerSpecificEvent, "deltaTime">
  | Omit<UnknownMetaEvent, "deltaTime">
  | Omit<NoteOffEvent, "deltaTime" | "channel">
  | Omit<NoteOnEvent, "deltaTime" | "channel">
  | Omit<NoteAftertouchEvent, "deltaTime" | "channel">
  | Omit<ProgramChangeEvent, "deltaTime" | "channel">
  | Omit<ChannelAftertouchEvent, "deltaTime" | "channel">
  | Omit<PitchBendEvent, "deltaTime" | "channel">
  | Omit<UnknownChannelEvent, "deltaTime" | "channel">
  | Omit<ControllerEvent, "deltaTime" | "channel">
  | Omit<SysExEvent, "deltaTime">
  | Omit<DividedSysExEvent, "deltaTime">

export type TrackEvent = NoteEvent | (TrackEventRequired & TrackMidiEvent)
