import _ from "lodash"

import Song from "common/song"
import Track, { conductorTrack, emptyTrack } from "common/track"

export function emptySong() {
  const song = new Song()
  song.addTrack(conductorTrack())
  song.addTrack(emptyTrack(0))
  song.name = "new song"
  song.filepath = "new song.mid"
  song.selectedTrackId = 1
  return song
}

export function songFromMidi(midi) {
  const song = new Song()
  midi.tracks.forEach(t => {
    const track = new Track()

    const chEvent = _.find(t.events, e => {
      return e.type === "channel"
    })
    track.channel = chEvent ? chEvent.channel : undefined
    track.addEvents(t.events)

    song.addTrack(track)
  })
  song.selectedTrackId = 1
  return song
}
