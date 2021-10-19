import { MIDIChannelEvents } from "midifile-ts"
import { parseMessage } from "./parseMessage"

export const serializeMessage = (e: ReturnType<typeof parseMessage>) => {
  const bytes: number[] = []

  function add(data: number | number[]) {
    if (Array.isArray(data)) {
      data.forEach(add)
    } else {
      if (!Number.isInteger(data)) {
        throw new Error(`"${data}" is not integer`)
      }
      bytes.push(data)
    }
  }

  if (e.subtype === "unknown") {
    return []
  }

  const subtypeCode = MIDIChannelEvents[e.subtype]
  if (subtypeCode === undefined) {
    return []
  }

  add((subtypeCode << 4) + e.channel) // subtype + channel
  switch (e.subtype) {
    case "noteOff": {
      add(e.noteNumber)
      add(e.velocity)
      break
    }
    case "noteOn": {
      add(e.noteNumber)
      add(e.velocity)
      break
    }
    case "noteAftertouch": {
      add(e.noteNumber)
      add(e.amount)
      break
    }
    case "controller": {
      add(e.controllerType)
      add(e.value)
      break
    }
    case "programChange":
      add(e.value)
      break
    case "channelAftertouch":
      add(e.amount)
      break
    case "pitchBend": {
      add(e.value & 0x7f)
      add((e.value >> 7) & 0x7f)
      break
    }
  }
  return bytes
}
