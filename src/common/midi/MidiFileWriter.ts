import * as _ from "lodash"
import { AnyEvent, write as writeMidiFile } from "midifile-ts"
import Track from "common/track"
import { toRawEvents } from "common/helpers/toRawEvents"

const setChannel = (channel: number) => (e: AnyEvent): AnyEvent => {
  if (e.type === "channel") {
    return { ...e, channel }
  }
  return e
}

export function write(tracks: Track[]) {
  const rawTracks = tracks.map((t) => {
    const rawEvents = toRawEvents(t.events)
    if (t.channel !== undefined) {
      return rawEvents.map(setChannel(t.channel))
    }
    return rawEvents
  })
  return writeMidiFile(rawTracks)
}
