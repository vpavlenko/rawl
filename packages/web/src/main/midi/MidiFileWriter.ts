import _ from "lodash"
import { write as writeMidiFile } from "@signal-app/midifile-ts"
import Track from "common/track"
import { toRawEvents } from "common/helpers/toRawEvents"

export function write(tracks: Track[], ticksPerBeat = 480) {
  const rawTracks = tracks.map(t => toRawEvents(t.events))
  return writeMidiFile(rawTracks)
}
