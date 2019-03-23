export interface Event<T extends string> {
    deltaTime: number;
    type: T;
}
export interface MetaEvent<T extends string> extends Event<"meta"> {
    subtype: T;
}
export interface SequenceNumberEvent extends MetaEvent<"sequenceNumber"> {
    number: number;
}
export interface TextEvent extends MetaEvent<"text"> {
    text: string;
}
export interface CopyrightNoticeEvent extends MetaEvent<"copyrightNotice"> {
    text: string;
}
export interface TrackNameEvent extends MetaEvent<"trackName"> {
    text: string;
}
export interface InstrumentNameEvent extends MetaEvent<"instrumentName"> {
    text: string;
}
export interface LyricsEvent extends MetaEvent<"lyrics"> {
    text: string;
}
export interface MarkerEvent extends MetaEvent<"marker"> {
    text: string;
}
export interface CuePointEvent extends MetaEvent<"cuePoint"> {
    text: string;
}
export interface ChannelPrefixEvent extends MetaEvent<"midiChannelPrefix"> {
    channel: number;
}
export interface PortPrefixEvent extends MetaEvent<"portPrefix"> {
    port: number;
}
export interface EndOfTrackEvent extends MetaEvent<"endOfTrack"> {
}
export interface SetTempoEvent extends MetaEvent<"setTempo"> {
    microsecondsPerBeat: number;
}
export interface SmpteOffsetEvent extends MetaEvent<"smpteOffset"> {
    frameRate: number;
    hour: number;
    min: number;
    sec: number;
    frame: number;
    subframe: number;
}
export interface TimeSignatureEvent extends MetaEvent<"timeSignature"> {
    numerator: number;
    denominator: number;
    metronome: number;
    thirtyseconds: number;
}
export interface KeySignatureEvent extends MetaEvent<"keySignature"> {
    key: number;
    scale: number;
}
export interface SequencerSpecificEvent extends MetaEvent<"sequencerSpecific"> {
    data: number[];
}
export interface UnknownMetaEvent extends MetaEvent<"unknown"> {
    data: number[];
}
export interface ChannelEvent<T extends string> extends Event<"channel"> {
    channel: number;
    subtype: T;
}
export interface NoteOffEvent extends ChannelEvent<"noteOff"> {
    noteNumber: number;
    velocity: number;
}
export interface NoteOnEvent extends ChannelEvent<"noteOn"> {
    noteNumber: number;
    velocity: number;
}
export interface NoteAftertouchEvent extends ChannelEvent<"noteAftertouch"> {
    noteNumber: number;
    amount: number;
}
export interface ProgramChangeEvent extends ChannelEvent<"programChange"> {
    value: number;
}
export interface ChannelAftertouchEvent extends ChannelEvent<"channelAftertouch"> {
    amount: number;
}
export interface PitchBendEvent extends ChannelEvent<"pitchBend"> {
    value: number;
}
export interface UnknownChannelEvent extends ChannelEvent<"unknown"> {
    data: number;
}
export interface ControllerEvent extends ChannelEvent<"controller"> {
    controllerType: number;
    value: number;
}
export interface SysExEvent extends Event<"sysEx"> {
    data: number[];
}
export interface DividedSysExEvent extends Event<"dividedSysEx"> {
    data: number[];
}
export declare type AnyEvent = SequenceNumberEvent | TextEvent | CopyrightNoticeEvent | TrackNameEvent | InstrumentNameEvent | LyricsEvent | MarkerEvent | CuePointEvent | ChannelPrefixEvent | PortPrefixEvent | EndOfTrackEvent | SetTempoEvent | SmpteOffsetEvent | TimeSignatureEvent | KeySignatureEvent | SequencerSpecificEvent | UnknownMetaEvent | NoteOffEvent | NoteOnEvent | NoteAftertouchEvent | ProgramChangeEvent | ChannelAftertouchEvent | PitchBendEvent | UnknownChannelEvent | ControllerEvent | SysExEvent | DividedSysExEvent;
