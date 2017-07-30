import MidiFile from "../submodules/jasmid/midifile"
import { addTick } from "../helpers/midiHelper"
import { assemble as assembleEvents } from "../helpers/noteAssembler"
import { assemble as assembleRPN } from "../helpers/RPNAssembler"

export function read(data) {
  const midi = MidiFile(data)
  return {
    tracks: midi.tracks
      .map(addTick)
      .map(assembleEvents)
      .map(assembleRPN)
      .map(events => ({ events }))
  }
}
