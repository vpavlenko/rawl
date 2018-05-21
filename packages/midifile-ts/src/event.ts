export interface Event {
  deltaTime: number
  type: string
}

export interface MetaEvent extends Event {
  type: "meta"
  subtype: string
}

/* Meta */

export interface SequenceNumberEvent extends MetaEvent {
  subtype: "sequenceNumber"
  number: number
}

export interface TextEvent extends MetaEvent {
  subtype: "text"
  text: string
}

export interface CopyrightNoticeEvent extends MetaEvent {
  subtype: "copyrightNotice"
  text: string
}

export interface TrackNameEvent extends MetaEvent {
  subtype: "trackName"
  text: string
}

export interface InstrumentNameEvent extends MetaEvent {
  subtype: "instrumentName"
  text: string
}

export interface LyricsEvent extends MetaEvent {
  subtype: "lyrics"
  text: string
}

export interface MarkerEvent extends MetaEvent {
  subtype: "marker"
  text: string
}

export interface CuePointEvent extends MetaEvent {
  subtype: "cuePoint"
  text: string
}

export interface ChannelPrefixEvent extends MetaEvent {
  subtype: "midiChannelPrefix"
  channel: number
}

export interface PortPrefixEvent extends MetaEvent {
  subtype: "portPrefix"
  port: number
}

export interface EndOfTrackEvent extends MetaEvent {
  subtype: "endOfTrack"
}

export interface SetTempoEvent extends MetaEvent {
  subtype: "setTempo"
  microsecondsPerBeat: number
}

export interface SmpteOffsetEvent extends MetaEvent {
  subtype: "smpteOffset"
  frameRate: number
  hour: number
  min: number
  sec: number
  frame: number
  subframe: number
}

export interface TimeSignatureEvent extends MetaEvent {
  subtype: "timeSignature"
  numerator: number
  denominator: number
  metronome: number
  thirtyseconds: number
}

export interface KeySignatureEvent extends MetaEvent {
  subtype: "keySignature"
  key: number
  scale: number
}

export interface SequencerSpecificEvent extends MetaEvent {
  subtype: "sequencerSpecific"
  data: number[]
}

export interface UnknownMetaEvent extends MetaEvent {
  subtype: "unknown"
  data: number[]
}

/* Channel */

export interface ChannelEvent extends Event {
  type: "channel"
  channel: number
  subtype: string
}

export interface NoteOffEvent extends ChannelEvent {
  subtype: "noteOff",
  noteNumber: number
  velocity: number
}

export interface NoteOnEvent extends ChannelEvent {
  subtype: "noteOn",
  noteNumber: number
  velocity: number
}

export interface NoteAftertouchEvent extends ChannelEvent {
  subtype: "noteAftertouch"
  noteNumber: number
  amount: number
}

export interface ProgramChangeEvent extends ChannelEvent {
  subtype: "programChange"
  value: number
}

export interface ChannelAftertouchEvent extends ChannelEvent {
  subtype: "channelAftertouch"
  amount: number
}

export interface PitchBendEvent extends ChannelEvent {
  subtype: "pitchBend"
  value: number
}

export interface UnknownChannelEvent extends ChannelEvent {
  subtype: "unknown"
  data: number[]
}

/* Controller */

export interface ControllerEvent extends ChannelEvent {
  subtype: "controller"
  controllerType: number
  value: number
}

/* Other */

export interface SysExEvent extends Event {
  type: "sysEx"
  data: number[]
}

export interface DividedSysExEvent extends Event {
  type: "dividedSysEx"
  data: number[]
}

export type AnyEvent = Event
  | MetaEvent
  | SequenceNumberEvent
  | TextEvent
  | CopyrightNoticeEvent
  | TrackNameEvent
  | InstrumentNameEvent
  | LyricsEvent
  | MarkerEvent
  | CuePointEvent
  | ChannelPrefixEvent
  | PortPrefixEvent
  | EndOfTrackEvent
  | SetTempoEvent
  | SmpteOffsetEvent
  | TimeSignatureEvent
  | KeySignatureEvent
  | SequencerSpecificEvent
  | UnknownMetaEvent
  | ChannelEvent
  | NoteOffEvent
  | NoteOnEvent
  | NoteAftertouchEvent
  | ProgramChangeEvent
  | ChannelAftertouchEvent
  | PitchBendEvent
  | UnknownChannelEvent
  | ControllerEvent
  | SysExEvent
  | DividedSysExEvent
