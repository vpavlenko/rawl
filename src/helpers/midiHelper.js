import MIDIChannelEvents from "../constants/MIDIChannelEvents"
import MIDIMetaEvents from "../constants/MIDIMetaEvents"

// separate notes to noteOn + noteOff
export function deassembleNoteEvents(e) {
  if (e.subtype == "note") {
    return [{
      type: "channel",
      subtype: "noteOn",
      tick: e.tick,
      channel: e.channel,
      noteNumber: e.noteNumber,
      velocity: e.velocity
    },
    {
      type: "channel",
      subtype: "noteOff",
      tick: e.tick + e.duration,
      channel: e.channel,
      noteNumber: e.noteNumber,
      velocity: 0
    }]
  } else {
    return [e]
  }
}

export function strToCharCodes(str) {
  const bytes = []
  for (let i = 0; i < str.length; i++) {
    bytes.push(str.charCodeAt(i))
  }
  return bytes
}

function varIntBytes(v) {
  const r = [v & 0x7f]
  while ((v >>= 7) > 0) {
    r.unshift(0x80 + (v & 0x7f))
  }
  return r
}

export function eventToBytes(e, includeDeltaTime = true) {
  const bytes = []
  function add(data) {
    if (data instanceof Array) {
      add(...data)
    } else {
      if (!Number.isInteger(data)) {
        throw `"${data}" is not integer`
      }
      bytes.push(data)
    }
  }

  if (includeDeltaTime) {
    add(varIntBytes(e.deltaTime))
  }

  switch (e.type) {
    case "meta":
      add(0xff) // type
      add(MIDIMetaEvents[e.subtype]) // subtype
      switch(e.subtype) {
        case "text":
        case "copyrightNotice":
        case "trackName":
        case "instrumentName":
        case "lyrics":
        case "cuePoint":
          add(e.value.length)
          add(strToCharCodes(e.value))
          break
        case "midiChannelPrefix":
        case "portPrefix":
          add(1)
          add(e.value)
          break
        case "endOfTrack":
          break
        case "setTempo":
          add(3) // data length
          add((e.value >> 16) & 0xff)
          add((e.value >> 8) & 0xff)
          add(e.value & 0xff)
          break
        case "timeSignature":
          add(4)
          add(e.numerator)
          add(Math.log2(e.denominator))
          add(e.metronome)
          add(e.thirtyseconds)
          break
        case "keySignature":
          add(2)
          add(e.key)
          add(e.scale)
          break
        case "sequencerSpecific":
        case "unknown":
          add(e.value.length)
          add(e.value)
          break
      }
      break
    case "sysEx":
      add(0xf0)
      add(e.data.length)
      add(e.data)
      break
    case "dividedSysEx":
      add(0xf7)
      add(e.data.length)
      add(e.data)
      break
    case "channel":
      add((MIDIChannelEvents[e.subtype] << 4) + e.channel) // subtype + channel
      switch(e.subtype) {
        case "noteOff":
        case "noteOn":
          add(e.noteNumber)
          add(e.velocity)
          break
        case "noteAftertouch":
          add(e.noteNumber)
          add(e.amount)
          break
        case "controller":
          add(e.controllerType)
          add(e.value)
          break
        case "programChange":
          add(e.value)
          break
        case "channelAftertouch":
          add(e.amount)
          break
        case "pitchBend":
          add(e.value & 0x7f)
          add((e.value >> 7) & 0x7f)
          break
        case "unknown":
          add(e.value)
          break
      }
      break
  }

  return bytes
}

// events in each tracks
export function addDeltaTime(events) {
  events.sort((a, b) => a.tick - b.tick)
  let prevTick = 0
  for (const e of events) {
    e.deltaTime = e.tick - prevTick
    prevTick = e.tick
  }
  return events
}
