import _ from "lodash"
import MidiFile from "../vendor/jasmid/midifile"

/**

  append tick to each events
  assemble noteOn and noteOff to single note event to append duration

 */
function assembleEvents(events) {
  const noteOnEvents = []

  function findNoteOn(noteOff) {
    const i = _.findIndex(noteOnEvents, e => {
      return e.channel == noteOff.channel &&
        e.noteNumber == noteOff.noteNumber && 
        e.track == noteOff.track
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
      case "trackName":
      case "endOfTrack":
      case "copyrightNotice":
        break
      default:
        result.push(e)
        break
    }
  })

  return result
}

function getTrackMeta(events) {
  const meta = {}
  events.forEach((e) => {
    switch(e.subtype) { 
      case "trackName":
        meta.name = e.text
        break
      case "endOfTrack":
        meta.end = e.tick
    }
  })
  return meta
}

function getFileMeta(tracks) {
  const meta = {}
  tracks.forEach((events) => {
    events.forEach((e) => {
      switch(e.subtype) { 
        case "copyrightNotice":
          meta.copyrightNotice = e.text
          break
      }
    })
  })
  return meta
}

export default class MidiFileReader {
  static read(file, callback) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const midi = MidiFile(e.target.result)
      const tracks = midi.tracks.map(events => {
        const anEvents = assembleEvents(events)
        const track = getTrackMeta(events)
        track.events = anEvents
        return track
      })
      const file = getFileMeta(midi.tracks)
      file.tracks = tracks
      callback(file)
    }
    reader.readAsBinaryString(file)
  }
}
