import {
  ChannelAftertouchEvent,
  ControllerEvent,
  NoteAftertouchEvent,
  NoteOffEvent,
  NoteOnEvent,
  PitchBendEvent,
  ProgramChangeEvent,
  Stream,
  UnknownChannelEvent,
} from "midifile-ts"

type MessageOf<T> = Omit<T, "deltaTime" | "type">

export function parseMessage(data: Uint8Array) {
  const stream = new Stream(data)
  const eventTypeByte = stream.readInt8()
  const param1 = stream.readInt8()
  const eventType = eventTypeByte >> 4
  const channel = eventTypeByte & 0x0f
  switch (eventType) {
    case 0x08:
      return <MessageOf<NoteOffEvent>>{
        channel,
        subtype: "noteOff",
        noteNumber: param1,
        velocity: stream.readInt8(),
      }
    case 0x09: {
      const velocity = stream.readInt8()
      return <MessageOf<NoteOnEvent>>{
        channel,
        subtype: velocity === 0 ? "noteOff" : "noteOn",
        noteNumber: param1,
        velocity: velocity,
      }
    }
    case 0x0a:
      return <MessageOf<NoteAftertouchEvent>>{
        channel,
        subtype: "noteAftertouch",
        noteNumber: param1,
        amount: stream.readInt8(),
      }
    case 0x0b:
      return <MessageOf<ControllerEvent>>{
        channel,
        subtype: "controller",
        controllerType: param1,
        value: stream.readInt8(),
      }
    case 0x0c:
      return <MessageOf<ProgramChangeEvent>>{
        channel,
        subtype: "programChange",
        value: param1,
      }
    case 0x0d:
      return <MessageOf<ChannelAftertouchEvent>>{
        channel,
        subtype: "channelAftertouch",
        amount: param1,
      }
    case 0x0e:
      return <MessageOf<PitchBendEvent>>{
        channel,
        subtype: "pitchBend",
        value: param1 + (stream.readInt8() << 7),
      }
    default:
      return <MessageOf<UnknownChannelEvent>>{
        channel,
        subtype: "unknown",
        data: stream.readInt8(),
      }
  }
}
