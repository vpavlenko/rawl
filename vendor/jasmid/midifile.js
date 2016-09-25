import Stream from "./stream"

/*
class to parse the .mid file format
(depends on stream.js)
*/
export default function MidiFile(data) {
  function readChunk(stream) {
    const id = stream.read(4)
    const length = stream.readInt32()
    return {
      "id": id,
      "length": length,
      "data": stream.read(length)
    }
  }

  var lastEventTypeByte

  function readEvent(stream) {
    const deltaTime = stream.readVarInt()
    var eventTypeByte = stream.readInt8()
    if ((eventTypeByte & 0xf0) == 0xf0) {
      /* system / meta event */
      if (eventTypeByte == 0xff) {
        /* meta event */
        const type = "meta"
        const subtypeByte = stream.readInt8()
        const length = stream.readVarInt()
        switch(subtypeByte) {
          case 0x00:
            if (length != 2) throw "Expected length for sequenceNumber event is 2, got " + length
            return {
              deltaTime: deltaTime,
              type: type,
              subtype: "sequenceNumber",
              number: stream.readInt16()
            }
          case 0x01:
            return {
              deltaTime: deltaTime,
              type: type,
              subtype: "text",
              text: stream.read(length)
            }
          case 0x02:
            return {
              deltaTime: deltaTime,
              type: type,
              subtype: "copyrightNotice",
              text: stream.read(length)
            }
          case 0x03:
            return {
              deltaTime: deltaTime,
              type: type,
              subtype: "trackName",
              text: stream.read(length)
            }
          case 0x04:
            return {
              deltaTime: deltaTime,
              type: type,
              subtype: "instrumentName",
              text: stream.read(length)
            }
          case 0x05:
            return {
              deltaTime: deltaTime,
              type: type,
              subtype: "lyrics",
              text: stream.read(length)
            }
          case 0x06:
            return {
              deltaTime: deltaTime,
              type: type,
              subtype: "marker",
              text: stream.read(length)
            }
          case 0x07:
            return {
              deltaTime: deltaTime,
              type: type,
              subtype: "cuePoint",
              text: stream.read(length)
            }
          case 0x20:
            if (length != 1) throw "Expected length for midiChannelPrefix event is 1, got " + length
            return {
              deltaTime: deltaTime,
              type: type,
              subtype: "midiChannelPrefix",
              channel: stream.readInt8()
            }
          case 0x2f:
            if (length != 0) throw "Expected length for endOfTrack event is 0, got " + length
            return {
              deltaTime: deltaTime,
              type: type,
              subtype: "endOfTrack"
            }
          case 0x51:
            if (length != 3) throw "Expected length for setTempo event is 3, got " + length
            return {
              deltaTime: deltaTime,
              type: type,
              subtype: "setTempo",
              microsecondsPerBeat: (
                (stream.readInt8() << 16)
                + (stream.readInt8() << 8)
                + stream.readInt8()
              )
            }
          case 0x54: {
            if (length != 5) throw "Expected length for smpteOffset event is 5, got " + length
            const hourByte = stream.readInt8()
            return {
              deltaTime: deltaTime,
              type: type,
              subtype: "smpteOffset",
              frameRate: {0x00: 24, 0x20: 25, 0x40: 29, 0x60: 30}[hourByte & 0x60],
              hour: hourByte & 0x1f,
              min: stream.readInt8(),
              sec: stream.readInt8(),
              frame: stream.readInt8(),
              subframe: stream.readInt8()
            }
          }
          case 0x58:
            if (length != 4) throw "Expected length for timeSignature event is 4, got " + length
            return {
              deltaTime: deltaTime,
              type: type,
              subtype: "timeSignature",
              numerator: stream.readInt8(),
              denominator: Math.pow(2, stream.readInt8()),
              metronome: stream.readInt8(),
              thirtyseconds: stream.readInt8()
            }
          case 0x59:
            if (length != 2) throw "Expected length for keySignature event is 2, got " + length
            return {
              deltaTime: deltaTime,
              type: type,
              subtype: "keySignature",
              key: stream.readInt8(true),
              scale: stream.readInt8()
            }
          case 0x7f:
            return {
              deltaTime: deltaTime,
              type: type,
              subtype: "sequencerSpecific",
              data: stream.read(length)
            }
          default:
            return {
              deltaTime: deltaTime,
              type: type,
              subtype: "unknown",
              data: stream.read(length)
            }
        }
      } else if (eventTypeByte == 0xf0) {
        const length = stream.readVarInt()
        return {
          deltaTime: deltaTime,
          type: "sysEx",
          data: stream.read(length)
        }
      } else if (eventTypeByte == 0xf7) {
        const length = stream.readVarInt()
        return {
          deltaTime: deltaTime,
          type: "dividedSysEx",
          data: stream.read(length)
        }
      } else {
        throw "Unrecognised MIDI event type byte: " + eventTypeByte
      }
    } else {
      /* channel event */
      var param1
      if ((eventTypeByte & 0x80) == 0) {
        /* running status - reuse lastEventTypeByte as the event type.
          eventTypeByte is actually the first parameter
        */
        param1 = eventTypeByte
        eventTypeByte = lastEventTypeByte
      } else {
        param1 = stream.readInt8()
        lastEventTypeByte = eventTypeByte
      }
      var eventType = eventTypeByte >> 4
      const channel = eventTypeByte & 0x0f
      const type = "channel"
      switch (eventType) {
        case 0x08:
          return {
            deltaTime: deltaTime,
            type: type,
            channel: channel,
            subtype: "noteOff",
            noteNumber: param1,
            velocity: stream.readInt8()
          }
        case 0x09: {
          const velocity = stream.readInt8()
          return {
            deltaTime: deltaTime,
            type: type,
            channel: channel,
            subtype: velocity == 0 ? "noteOff" : "noteOn",
            noteNumber: param1,
            velocity: velocity
          }
        }
        case 0x0a:
          return {
            deltaTime: deltaTime,
            type: type,
            channel: channel,
            subtype: "noteAftertouch",
            noteNumber: param1,
            amount: stream.readInt8()
          }
        case 0x0b:
          return {
            deltaTime: deltaTime,
            type: type,
            channel: channel,
            subtype: "controller",
            controllerType: param1,
            value: stream.readInt8()
          }
        case 0x0c:
          return {
            deltaTime: deltaTime,
            type: type,
            channel: channel,
            subtype: "programChange",
            programNumber: param1
          }
        case 0x0d:
          return {
            deltaTime: deltaTime,
            type: type,
            channel: channel,
            subtype: "channelAftertouch",
            amount: param1
          }
        case 0x0e:
          return {
            deltaTime: deltaTime,
            type: type,
            channel: channel,
            subtype: "pitchBend",
            value: param1 + (stream.readInt8() << 7)
          }
        default:
          return {
            deltaTime: deltaTime,
            type: type,
            channel: channel,
            subtype: "unknown",
            value: stream.readInt8()
          }
      }
    }
  }

  const stream = Stream(data)
  const headerChunk = readChunk(stream)
  if (headerChunk.id != "MThd" || headerChunk.length != 6) {
    throw "Bad .mid file - header not found"
  }
  const headerStream = Stream(headerChunk.data)
  const formatType = headerStream.readInt16()
  const trackCount = headerStream.readInt16()
  const timeDivision = headerStream.readInt16()

  let ticksPerBeat
  if (timeDivision & 0x8000) {
    throw "Expressing time division in SMTPE frames is not supported yet"
  } else {
    ticksPerBeat = timeDivision
  }

  const header = {
    "formatType": formatType,
    "trackCount": trackCount,
    "ticksPerBeat": ticksPerBeat
  }
  const tracks = []
  for (var i = 0; i < header.trackCount; i++) {
    tracks[i] = []
    const trackChunk = readChunk(stream)
    if (trackChunk.id != "MTrk") {
      throw "Unexpected chunk - expected MTrk, got "+ trackChunk.id
    }
    const trackStream = Stream(trackChunk.data)
    while (!trackStream.eof()) {
      const event = readEvent(trackStream)
      tracks[i].push(event)
    }
  }

  return {
    "header": header,
    "tracks": tracks
  }
}
