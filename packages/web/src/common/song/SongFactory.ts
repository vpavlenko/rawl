import _ from "lodash"

import Song from "common/song"
import Track, { conductorTrack, emptyTrack } from "common/track"
import { read as readMidi, Data } from "@signal-app/midifile-ts"
import { addTick } from "../helpers/midiHelper"
import { toTrackEvents } from "../helpers/eventAssembler"

export function emptySong() {
  const song = new Song()
  song.addTrack(conductorTrack())
  song.addTrack(emptyTrack(0))
  song.name = "new song"
  song.filepath = "new song.mid"
  song.selectedTrackId = 1
  return song
}

export function songFromMidi(data: Data<number>) {
  const song = new Song()

  const midi = readMidi(data)
  const tracks = midi.tracks
    .map(addTick)
    .map(toTrackEvents)
    .map(events => ({ events }))

  tracks.forEach(t => {
    const track = new Track()

    const chEvent = _.find(t.events, e => {
      return e.type === "channel"
    })
    track.channel = "channel" in chEvent ? chEvent.channel : undefined
    track.addEvents(t.events.map(e => ({ ...e, tick: 0, id: -1 })))

    song.addTrack(track)
  })
  song.selectedTrackId = 1
  return song
}
