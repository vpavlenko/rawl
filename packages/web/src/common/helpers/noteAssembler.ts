import _ from "lodash"
import { NoteOnEvent, NoteOffEvent, AnyEvent } from "@signal-app/midifile-ts"
import { TrackEvent, NoteEvent, TrackEventRequired } from "common/track"
import { noteOnMidiEvent, noteOffMidiEvent } from "common/midi/MidiEvent"

/**

  assemble noteOn and noteOff to single note event to append duration

 */
export function assemble(events: TrackEvent[]): TrackEvent[] {
  const noteOnEvents: (TrackEventRequired & NoteOnEvent)[] = []

  function findNoteOn(
    noteOff: TrackEventRequired & NoteOffEvent
  ): (TrackEventRequired & NoteOnEvent) | null {
    const i = _.findIndex(noteOnEvents, e => {
      return (
        e.channel === noteOff.channel && e.noteNumber === noteOff.noteNumber
      )
    })
    if (i < 0) {
      return null
    }
    const e = noteOnEvents[i]
    noteOnEvents.splice(i, 1)
    return e
  }

  const result: TrackEvent[] = []
  events.forEach(e => {
    switch ((e as any).subtype) {
      case "noteOn":
        noteOnEvents.push(e as (TrackEventRequired & NoteOnEvent))
        break
      case "noteOff": {
        const ev = e as (TrackEventRequired & NoteOffEvent)
        const noteOn = findNoteOn(ev)
        if (noteOn != null) {
          const note: NoteEvent = {
            ...noteOn,
            subtype: "note",
            id: -1,
            tick: noteOn.tick,
            duration: ev.tick - noteOn.tick
          }
          result.push(note)
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
export function deassemble(e: TrackEvent): TrackEvent[] {
  if ("subtype" in e && e.subtype === "note") {
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
