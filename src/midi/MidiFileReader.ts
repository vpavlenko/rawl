import MidiFile from "../midifile/midifile.ts"
import { addTick } from "../helpers/midiHelper.ts"
import { toTrackEvents } from "../helpers/eventAssembler.ts"

export function read(data) {
  const midi = MidiFile(data)
  return {
    tracks: midi.tracks
      .map(addTick)
      .map(toTrackEvents)
      .map(events => ({ events }))
  }
}
