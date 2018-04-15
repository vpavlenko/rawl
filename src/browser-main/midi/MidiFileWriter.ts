import _ from "lodash"
import { write as writeMidiFile } from "midifile-ts"
import { addDeltaTime } from "helpers/midiHelper"
import { toRawEvents } from "helpers/eventAssembler"
import Track from "stores/Track"

export function write(tracks: Track[], ticksPerBeat = 480) {
  const rawTracks = tracks.map(t => {
    const rawEvents = _.flatten(t.events.map(toRawEvents))
    const events = addDeltaTime(rawEvents)
    return events
  })

  return writeMidiFile(rawTracks)
}
