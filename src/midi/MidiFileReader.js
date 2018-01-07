import MidiFile from "../submodules/jasmid/midifile"
import { addTick } from "../helpers/midiHelper"
import { toTrackEvents } from "../helpers/eventAssembler"

export function read(data) {
  const midi = MidiFile(data)
  return {
    tracks: midi.tracks
      .map(addTick)
      .map(toTrackEvents)
      .map(events => ({ events }))
  }
}
