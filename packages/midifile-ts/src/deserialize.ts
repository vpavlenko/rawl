import {
  SequenceNumberEvent,
  TextEvent,
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
  SysExEvent,
  DividedSysExEvent,
  NoteOffEvent,
  NoteOnEvent,
  NoteAftertouchEvent,
  ControllerEvent,
  ProgramChangeEvent,
  ChannelAftertouchEvent,
  PitchBendEvent,
  UnknownChannelEvent,
  AnyEvent
} from "./event"
import Stream from "./stream"

export default function deserialize(
  stream: Stream,
  lastEventTypeByte: number,
  setLastEventTypeByte: (eventType: number) => void
): AnyEvent {
  const deltaTime = stream.readVarInt()
  let eventTypeByte = stream.readInt8()
  if ((eventTypeByte & 0xf0) === 0xf0) {
    /* system / meta event */
    if (eventTypeByte === 0xff) {
      /* meta event */
      const type = "meta"
      const subtypeByte = stream.readInt8()
      const length = stream.readVarInt()
      switch (subtypeByte) {
        case 0x00:
          if (length !== 2)
            throw new Error(
              "Expected length for sequenceNumber event is 2, got " + length
            )
          return <SequenceNumberEvent>{
            deltaTime,
            type,
            subtype: "sequenceNumber",
            number: stream.readInt16()
          }
        case 0x01:
          return <TextEvent>{
            deltaTime,
            type,
            subtype: "text",
            text: stream.readStr(length)
          }
        case 0x02:
          return <CopyrightNoticeEvent>{
            deltaTime,
            type,
            subtype: "copyrightNotice",
            text: stream.readStr(length)
          }
        case 0x03:
          return <TrackNameEvent>{
            deltaTime,
            type,
            subtype: "trackName",
            text: stream.readStr(length)
          }
        case 0x04:
          return <InstrumentNameEvent>{
            deltaTime,
            type,
            subtype: "instrumentName",
            text: stream.readStr(length)
          }
        case 0x05:
          return <LyricsEvent>{
            deltaTime,
            type,
            subtype: "lyrics",
            text: stream.readStr(length)
          }
        case 0x06:
          return <MarkerEvent>{
            deltaTime,
            type,
            subtype: "marker",
            text: stream.readStr(length)
          }
        case 0x07:
          return <CuePointEvent>{
            deltaTime,
            type,
            subtype: "cuePoint",
            text: stream.readStr(length)
          }
        case 0x20:
          if (length !== 1)
            throw new Error(
              "Expected length for midiChannelPrefix event is 1, got " + length
            )
          return <ChannelPrefixEvent>{
            deltaTime,
            type,
            subtype: "midiChannelPrefix",
            channel: stream.readInt8()
          }
        case 0x21:
          if (length !== 1)
            throw new Error(
              "Expected length for midiChannelPrefix event is 1, got " + length
            )
          return <PortPrefixEvent>{
            deltaTime,
            type,
            subtype: "portPrefix",
            port: stream.readInt8()
          }
        case 0x2f:
          if (length !== 0)
            throw new Error(
              "Expected length for endOfTrack event is 0, got " + length
            )
          return <EndOfTrackEvent>{
            deltaTime,
            type,
            subtype: "endOfTrack"
          }
        case 0x51:
          if (length !== 3)
            throw new Error(
              "Expected length for setTempo event is 3, got " + length
            )
          return <SetTempoEvent>{
            deltaTime,
            type,
            subtype: "setTempo",
            microsecondsPerBeat:
              (stream.readInt8() << 16) +
              (stream.readInt8() << 8) +
              stream.readInt8()
          }
        case 0x54: {
          if (length !== 5)
            throw new Error(
              "Expected length for smpteOffset event is 5, got " + length
            )
          const hourByte = stream.readInt8()
          const table: { [key: number]: number } = {
            0x00: 24,
            0x20: 25,
            0x40: 29,
            0x60: 30
          }
          return <SmpteOffsetEvent>{
            deltaTime,
            type,
            subtype: "smpteOffset",
            frameRate: table[hourByte & 0x60],
            hour: hourByte & 0x1f,
            min: stream.readInt8(),
            sec: stream.readInt8(),
            frame: stream.readInt8(),
            subframe: stream.readInt8()
          }
        }
        case 0x58:
          if (length !== 4)
            throw new Error(
              "Expected length for timeSignature event is 4, got " + length
            )
          return <TimeSignatureEvent>{
            deltaTime,
            type,
            subtype: "timeSignature",
            numerator: stream.readInt8(),
            denominator: Math.pow(2, stream.readInt8()),
            metronome: stream.readInt8(),
            thirtyseconds: stream.readInt8()
          }
        case 0x59:
          if (length !== 2)
            throw new Error(
              "Expected length for keySignature event is 2, got " + length
            )
          return <KeySignatureEvent>{
            deltaTime,
            type,
            subtype: "keySignature",
            key: stream.readInt8(true),
            scale: stream.readInt8()
          }
        case 0x7f:
          return <SequencerSpecificEvent>{
            deltaTime,
            type,
            subtype: "sequencerSpecific",
            data: stream.read(length)
          }
        default:
          return <UnknownMetaEvent>{
            deltaTime,
            type,
            subtype: "unknown",
            data: stream.read(length)
          }
      }
    } else if (eventTypeByte === 0xf0) {
      const length = stream.readVarInt()
      return <SysExEvent>{
        deltaTime,
        type: "sysEx",
        data: stream.read(length)
      }
    } else if (eventTypeByte === 0xf7) {
      const length = stream.readVarInt()
      return <DividedSysExEvent>{
        deltaTime,
        type: "dividedSysEx",
        data: stream.read(length)
      }
    } else {
      throw new Error("Unrecognised MIDI event type byte: " + eventTypeByte)
    }
  } else {
    /* channel event */
    let param1
    if ((eventTypeByte & 0x80) === 0) {
      /* running status - reuse lastEventTypeByte as the event type.
        eventTypeByte is actually the first parameter
      */
      param1 = eventTypeByte
      eventTypeByte = lastEventTypeByte
    } else {
      param1 = stream.readInt8()
      setLastEventTypeByte(eventTypeByte)
    }
    const eventType = eventTypeByte >> 4
    const channel = eventTypeByte & 0x0f
    const type = "channel"
    switch (eventType) {
      case 0x08:
        return <NoteOffEvent>{
          deltaTime,
          type,
          channel,
          subtype: "noteOff",
          noteNumber: param1,
          velocity: stream.readInt8()
        }
      case 0x09: {
        const velocity = stream.readInt8()
        return <NoteOnEvent>{
          deltaTime,
          type,
          channel,
          subtype: velocity === 0 ? "noteOff" : "noteOn",
          noteNumber: param1,
          velocity: velocity
        }
      }
      case 0x0a:
        return <NoteAftertouchEvent>{
          deltaTime,
          type,
          channel,
          subtype: "noteAftertouch",
          noteNumber: param1,
          amount: stream.readInt8()
        }
      case 0x0b:
        return <ControllerEvent>{
          deltaTime,
          type,
          channel,
          subtype: "controller",
          controllerType: param1,
          value: stream.readInt8()
        }
      case 0x0c:
        return <ProgramChangeEvent>{
          deltaTime,
          type,
          channel,
          subtype: "programChange",
          value: param1
        }
      case 0x0d:
        return <ChannelAftertouchEvent>{
          deltaTime,
          type,
          channel,
          subtype: "channelAftertouch",
          amount: param1
        }
      case 0x0e:
        return <PitchBendEvent>{
          deltaTime,
          type,
          channel,
          subtype: "pitchBend",
          value: param1 + (stream.readInt8() << 7)
        }
      default:
        return <UnknownChannelEvent>{
          deltaTime,
          type,
          channel,
          subtype: "unknown",
          data: stream.readInt8()
        }
    }
  }
}
