import assert from "assert"
import { write } from "./MidiFileWriter"
import Track from "stores/Track"
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
      track.addEvent(SetTempoMidiEvent(0, 60000000 / 120))
      track.addEvent(TrackNameMidiEvent(0, ""))
      track.addEvent(TimeSignatureMidiEvent(0, 4, 4, 24, 8))
      track.addEvent(EndOfTrackMidiEvent(0))
      tracks.push(track)
    }

    {
      const track = new Track
      track.addEvent(TrackNameMidiEvent(0, ""))
      track.addEvent(PortPrefixMidiEvent(0, 0))
      track.addEvent(EndOfTrackMidiEvent(480))
      tracks.push(track)
    }

    const bytes = write(tracks, 480)
  })
})
