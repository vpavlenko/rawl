import _ from "lodash"
import path from "path"
import MidiFile from "../submodules/jasmid/midifile"
import Song from "../model/Song"

const { remote } = window.require("electron")
const fs = remote.require("fs")

/**

  append tick to each events
  assemble noteOn and noteOff to single note event to append duration

 */
function assembleEvents(events) {
  const noteOnEvents = []

  function findNoteOn(noteOff) {
    const i = _.findIndex(noteOnEvents, e => {
      return e.channel === noteOff.channel &&
        e.noteNumber === noteOff.noteNumber &&
        e.track === noteOff.track
    })
    if (i < 0) {
      return null
    }
    const e = noteOnEvents[i]
    noteOnEvents.splice(i, 1)
    return e
  }

  var tick = 0
  const result = []
  events.forEach((e) => {
    tick += e.deltaTime
    e.tick = tick

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

export default class MidiFileReader {
  static read(data) {
    const midi = MidiFile(data)
    return {
      tracks: midi.tracks
        .map(assembleEvents)
        .map(events => ({ events }))
    }
  }

  static readFile(file, callback) {
    fs.readFile(file, (e, data) => {
      const midi = this.read(data)
      const song = Song.fromMidi(midi)
      song.filepath = file
      song.name = path.basename(file.replace(/\\/g, "/"))
      callback(e, song)
    })
  }
}
