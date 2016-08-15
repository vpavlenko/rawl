import assert from "assert"
import MidiFileWriter from "../src/midi-file-writer"
import Track from "../src/model/track"
import MidiFile from "../vendor/jasmid/midifile"
import {
  SetTempoMidiEvent, 
  TimeSignatureMidiEvent 
} from "../vendor/jasmid/midievent.js"

describe("MidiFileWriter", () => {
  const track0 = new Track
  track0.addEvent(new SetTempoMidiEvent(0, 200))
  track0.addEvent(new TimeSignatureMidiEvent(0, 3, 5, 4, 8))
  const track1 = new Track
  const tracks = [track0, track1]

  const bytes = MidiFileWriter.write(tracks, 480)

  it("getX", () => {
    const midi = MidiFile(bytes)
    console.dir(midi.tracks)
  })

  it("example", () => {
    assert.equal(0, 0)
  })
})
