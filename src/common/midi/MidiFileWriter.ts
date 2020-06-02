import * as _ from "lodash"
import { write as writeMidiFile } from "midifile-ts"
import Track from "common/track"
import { toRawEvents } from "common/helpers/toRawEvents"

export function write(tracks: Track[]) {
  const rawTracks = tracks.map(t => toRawEvents(t.events))
  return writeMidiFile(rawTracks)
}
