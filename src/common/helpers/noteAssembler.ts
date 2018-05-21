import _ from "lodash"
import { NoteOnEvent, NoteOffEvent } from "midifile-ts"
import { TrackEvent } from "common/track"
import { noteOnMidiEvent, noteOffMidiEvent } from "common/midi/MidiEvent";

export interface NoteEvent {
  subtype: "note"
  tick: number
  duration: number
}

/**

  assemble noteOn and noteOff to single note event to append duration

 */
export function assemble(events) {
  const noteOnEvents = []

  function findNoteOn(noteOff) {
    const i = _.findIndex(noteOnEvents, e => {
      return e.channel === noteOff.channel &&
        e.noteNumber === noteOff.noteNumber
    })
    if (i < 0) {
      return null
    }
    const e = noteOnEvents[i]
    noteOnEvents.splice(i, 1)
    return e
  }

  const result = []
  events.forEach((e) => {
    switch(e.subtype) {
      case "noteOn":
        noteOnEvents.push(e)
        break
      case "noteOff": {
        const noteOn = findNoteOn(e)
        if (noteOn != null) {
          noteOn.duration = e.tick - noteOn.tick
          noteOn.subtype = "note"
          result.push(noteOn)
        }
        break
      }
      default:
        result.push(e)
        break
    }
  })

  return result
}

// separate note to noteOn + noteOff
export function deassemble(e): TrackEvent[] {
  if (e.subtype === "note") {
    const noteOn = noteOnMidiEvent(0, e.channel, e.noteNumber, e.velocity)
    const noteOff = noteOffMidiEvent(0, e.channel, e.noteNumber)
    return [
      { ...noteOn, id: -1, tick: e.tick },
      { ...noteOff, id: -1, tick: e.tick + e.duration - 1 } // -1 to prevent overlap 
    ]
  } else {
    return [e]
  }
}
