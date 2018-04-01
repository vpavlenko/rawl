import assert from "assert"
import { write } from "./MidiFileWriter"
import Track from "../stores/Track"
import {
  setTempoMidiEvent,
  timeSignatureMidiEvent,
  trackNameMidiEvent,
  endOfTrackMidiEvent,
  portPrefixMidiEvent
} from "./MidiEvent"

describe("MidiFileWriter", () => {
  it("write", () => {
    const tracks = []
    {
      const track = new Track
      track.addEvent(setTempoMidiEvent(0, 60000000 / 120))
      track.addEvent(trackNameMidiEvent(0, ""))
      track.addEvent(timeSignatureMidiEvent(0, 4, 4, 24, 8))
      track.addEvent(endOfTrackMidiEvent(0))
      tracks.push(track)
    }

    {
      const track = new Track
      track.addEvent(trackNameMidiEvent(0, ""))
      track.addEvent(portPrefixMidiEvent(0, 0))
      track.addEvent(endOfTrackMidiEvent(480))
      tracks.push(track)
    }

    const bytes = write(tracks, 480)
  })
})
