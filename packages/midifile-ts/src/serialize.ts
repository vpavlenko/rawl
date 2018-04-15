import {
  Event, 
  MetaEvent, 
  TextEvent, 
  CopyrightNoticeEvent, 
  TrackNameEvent, 
  InstrumentNameEvent, 
  LyricsEvent, 
  CuePointEvent, 
  PortPrefixEvent, 
  SetTempoEvent, 
  TimeSignatureEvent, 
  KeySignatureEvent, 
  SequencerSpecificEvent, 
  SysExEvent, 
  DividedSysExEvent, 
  ChannelEvent, 
  NoteOffEvent, 
  NoteOnEvent, 
  NoteAftertouchEvent, 
  ControllerEvent, 
  ProgramChangeEvent, 
  ChannelAftertouchEvent,
  PitchBendEvent, 
  UnknownChannelEvent, 
  UnknownMetaEvent, 
  ChannelPrefixEvent 
} from "./event"
import { toVLQ } from "./vlq"
import toCharCodes from "./toCharCodes"
import MIDIChannelEvents from "./constants/MIDIChannelEvents"
import MIDIMetaEvents from "./constants/MIDIMetaEvents"

export default function serialize(event: Event, includeDeltaTime = true) {
  const bytes: number[] = []

  function add(data) {
    if (data.forEach !== undefined) {
      data.forEach(add)
    } else {
      if (!Number.isInteger(data)) {
        throw new Error(`"${data}" is not integer`)
      }
      bytes.push(data)
    }
  }

  if (includeDeltaTime) {
    add(toVLQ(event.deltaTime))
  }

  function addNumbers(list: number[]) {
    add(list.length)
    list.forEach(v => add(v))
  }

  function addText(text: string) {
    add(text.length)
    add(toCharCodes(text))
  }

  switch (event.type) {
    case "meta": {
      const e = event as MetaEvent
      const subtypeCode = MIDIMetaEvents[e.subtype]
      if (subtypeCode === undefined) {
        return []
      }
      add(0xff) // type
      add(subtypeCode) // subtype
      switch(e.subtype) {
        case "text":
          addText((e as TextEvent).text)
          break
        case "copyrightNotice":
          addText((e as CopyrightNoticeEvent).text)
          break
        case "trackName":
          addText((e as TrackNameEvent).text)
          break
        case "instrumentName":
          addText((e as InstrumentNameEvent).text)
          break
        case "lyrics":
          addText((e as LyricsEvent).text)
          break
        case "cuePoint":
          addText((e as CuePointEvent).text)
          break
        case "midiChannelPrefix":
          addNumbers([(e as ChannelPrefixEvent).channel])
          break
        case "portPrefix":
          addNumbers([(e as PortPrefixEvent).port])
          break
        case "endOfTrack":
          add(0)
          break
        case "setTempo": {
          const t = (e as SetTempoEvent).microsecondsPerBeat
          addNumbers([
            (t >> 16) & 0xff,
            (t >> 8) & 0xff,
            t & 0xff
          ])
          break
        }
        case "timeSignature": {
          const ev = e as TimeSignatureEvent
          addNumbers([
            ev.numerator,
            Math.log2(ev.denominator),
            ev.metronome,
            ev.thirtyseconds
          ])
          break
        }
        case "keySignature": {
          const ev = e as KeySignatureEvent
          addNumbers([
            ev.key,
            ev.scale
          ])
          break
        }
        case "sequencerSpecific":
          addNumbers((e as SequencerSpecificEvent).data)
          break
        case "unknown":
          addNumbers((e as UnknownMetaEvent).data)
          break
        default:
          break
      }
      break
    }
    case "sysEx":
      add(0xf0)
      addNumbers((event as SysExEvent).data)
      break
    case "dividedSysEx":
      add(0xf7)
      addNumbers((event as DividedSysExEvent).data)
      break
    case "channel": {
      const e = event as ChannelEvent
      const subtypeCode = MIDIChannelEvents[e.subtype]
      if (subtypeCode === undefined) {
        return []
      }
      add((subtypeCode << 4) + e.channel) // subtype + channel
      switch(e.subtype) {
        case "noteOff": {
          const ev = e as NoteOffEvent
          add(ev.noteNumber)
          add(ev.velocity)
          break
        }
        case "noteOn": {
          const ev = e as NoteOnEvent
          add(ev.noteNumber)
          add(ev.velocity)
          break
        }
        case "noteAftertouch": {
          const ev = e as NoteAftertouchEvent
          add(ev.noteNumber)
          add(ev.amount)
          break
        }
        case "controller": {
          const ev = e as ControllerEvent
          add(ev.controllerType)
          add(ev.value)
          break
        }
        case "programChange":
          add((e as ProgramChangeEvent).value)
          break
        case "channelAftertouch":
          add((e as ChannelAftertouchEvent).amount)
          break
        case "pitchBend": {
          const ev = e as PitchBendEvent
          add(ev.value & 0x7f)
          add((ev.value >> 7) & 0x7f)
          break
        }
        case "unknown":
          add((e as UnknownChannelEvent).data)
          break
        default:
          break
      }
      break
    }
    default:
  }

  return bytes
}
