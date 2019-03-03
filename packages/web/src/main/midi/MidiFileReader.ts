import { read as readMidi } from "@signal-app/midifile-ts"
import { addTick } from "helpers/midiHelper"
import { toTrackEvents } from "helpers/eventAssembler"

export function read(data) {
  const midi = readMidi(data)
  return {
    tracks: midi.tracks
      .map(addTick)
      .map(toTrackEvents)
      .map(events => ({ events }))
  }
}
