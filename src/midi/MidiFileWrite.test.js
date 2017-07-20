import assert from "assert"
import { write } from "./MidiFileWriter"
import Track from "../model/Track"
import {
  SetTempoMidiEvent,
  TimeSignatureMidiEvent,
  TrackNameMidiEvent,
  EndOfTrackMidiEvent,
  PortPrefixMidiEvent
} from "./MidiEvent"

describe("MidiFileWriter", () => {
  it("write", () => {
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

    const bytes = write(tracks, 480)
  })
})
