/**

  append time to each events
  assemble noteOn and noteOff to single note event to append duration

 */
function assembleEvents(events) {
  const noteOnEvents = []

  function findNoteOn(noteOff) {
    for (const i in noteOnEvents) {
      const e = noteOnEvents[i]
      if (e.channel == noteOff.channel &&
          e.noteNumber == noteOff.noteNumber && 
          e.track == noteOff.track) {
        noteOnEvents.splice(i, 1)
        return e
      }
    }
    return null
  }

  var time = 0
  const result = []
  events.forEach((e) => {
    time += e.deltaTime
    e.time = time

    switch(e.subtype) { 
    case "noteOn":
      noteOnEvents.push(e)
      break
    case "noteOff":
      const noteOn = findNoteOn(e)
      if (noteOn != null) {
        noteOn.duration = e.time - noteOn.time
        noteOn.subtype = "note"
        result.push(noteOn)
      }
      break
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
      meta.end = e.time
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

class MidiFileReader {
  static read(file, callback) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const midi = MidiFile(e.target.result)
      var id = 0
      const tracks = midi.tracks.map((events, i) => {
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
