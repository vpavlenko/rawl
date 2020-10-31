import {
  ChannelAftertouchEvent,
  ChannelPrefixEvent,
  ControllerEvent,
  CopyrightNoticeEvent,
  CuePointEvent,
  DividedSysExEvent,
  EndOfTrackEvent,
  InstrumentNameEvent,
  KeySignatureEvent,
  LyricsEvent,
  MarkerEvent,
  NoteAftertouchEvent,
  NoteOffEvent,
  NoteOnEvent,
  PitchBendEvent,
  PortPrefixEvent,
  ProgramChangeEvent,
  SequenceNumberEvent,
  SequencerSpecificEvent,
  SetTempoEvent,
  SmpteOffsetEvent,
  SysExEvent,
  TextEvent,
  TimeSignatureEvent,
  TrackNameEvent,
  UnknownChannelEvent,
  UnknownMetaEvent,
} from "midifile-ts"
import { RPNEvent } from "../helpers/RPNAssembler"

interface PlayerRequired {
  tick: number
}

export type PlayerEvent =
  | (PlayerRequired & Omit<RPNEvent, "deltaTime">)
  | (PlayerRequired & Omit<SequenceNumberEvent, "deltaTime">)
  | (PlayerRequired & Omit<TextEvent, "deltaTime">)
  | (PlayerRequired & Omit<CopyrightNoticeEvent, "deltaTime">)
  | (PlayerRequired & Omit<TrackNameEvent, "deltaTime">)
  | (PlayerRequired & Omit<InstrumentNameEvent, "deltaTime">)
  | (PlayerRequired & Omit<LyricsEvent, "deltaTime">)
  | (PlayerRequired & Omit<MarkerEvent, "deltaTime">)
  | (PlayerRequired & Omit<CuePointEvent, "deltaTime">)
  | (PlayerRequired & Omit<ChannelPrefixEvent, "deltaTime">)
  | (PlayerRequired & Omit<PortPrefixEvent, "deltaTime">)
  | (PlayerRequired & Omit<EndOfTrackEvent, "deltaTime">)
  | (PlayerRequired & Omit<SetTempoEvent, "deltaTime">)
  | (PlayerRequired & Omit<SmpteOffsetEvent, "deltaTime">)
  | (PlayerRequired & Omit<TimeSignatureEvent, "deltaTime">)
  | (PlayerRequired & Omit<KeySignatureEvent, "deltaTime">)
  | (PlayerRequired & Omit<SequencerSpecificEvent, "deltaTime">)
  | (PlayerRequired & Omit<UnknownMetaEvent, "deltaTime">)
  | (PlayerRequired & Omit<NoteOffEvent, "deltaTime">)
  | (PlayerRequired & Omit<NoteOnEvent, "deltaTime">)
  | (PlayerRequired & Omit<NoteAftertouchEvent, "deltaTime">)
  | (PlayerRequired & Omit<ProgramChangeEvent, "deltaTime">)
  | (PlayerRequired & Omit<ChannelAftertouchEvent, "deltaTime">)
  | (PlayerRequired & Omit<PitchBendEvent, "deltaTime">)
  | (PlayerRequired & Omit<UnknownChannelEvent, "deltaTime">)
  | (PlayerRequired & Omit<ControllerEvent, "deltaTime">)
  | (PlayerRequired & Omit<SysExEvent, "deltaTime">)
  | (PlayerRequired & Omit<DividedSysExEvent, "deltaTime">)
