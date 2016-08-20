import assert from "assert"
import MidiFileWriter from "../src/midi-file-writer"
import Track from "../src/model/track"
import MidiFile from "../vendor/jasmid/midifile"
import {
  SetTempoMidiEvent, 
  TimeSignatureMidiEvent,
  TrackNameMidiEvent,
  EndOfTrackMidiEvent,
  PortPrefixMidiEvent
} from "../vendor/jasmid/midievent.js"
import fs from "fs"

describe("MidiFileWriter", () => {
  const tracks = []
  {
    const track = new Track
    track.addEvent(new SetTempoMidiEvent(0, 60000000 / 120))
    track.addEvent(new TrackNameMidiEvent(0, ""))
    track.addEvent(new TimeSignatureMidiEvent(0, 4, 4, 24, 8))
    track.addEvent(new EndOfTrackMidiEvent(0))
    tracks.push(track)
  }

  {
    const track = new Track
    track.addEvent(new TrackNameMidiEvent(0, ""))
    track.addEvent(new PortPrefixMidiEvent(0, 0))
    track.addEvent({
      tick: 0,
      type: "channel",
      subtype: "note",
      channel: 0,
      noteNumber: 72,
      velocity: 100,
      duration: 480
    })
    track.addEvent(new EndOfTrackMidiEvent(480))
    tracks.push(track)
  }

  const bytes = MidiFileWriter.write(tracks, 480)
  fs.writeFileSync("test.mid", new Buffer(bytes))
})
