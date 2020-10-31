import { AnyEvent, read as readMidi, StreamSource } from "midifile-ts"
import { toTrackEvents } from "../helpers/toTrackEvents"
import Track, { conductorTrack, emptyTrack } from "../track"
import Song from "./Song"

export function emptySong() {
  const song = new Song()
  song.addTrack(conductorTrack())
  song.addTrack(emptyTrack(0))
  song.name = "new song"
  song.filepath = "new song.mid"
  song.selectedTrackId = 1
  return song
}

const trackFromMidiEvents = (events: AnyEvent[]): Track => {
  const track = new Track()

  const chEvent = events.find((e) => {
    return e.type === "channel"
  })
  if (chEvent !== undefined && "channel" in chEvent) {
    track.channel = chEvent.channel
  }
  track.addEvents(toTrackEvents(events))

  return track
}

export function songFromMidi(data: StreamSource) {
  const song = new Song()
  const midi = readMidi(data)

  midi.tracks.map(trackFromMidiEvents).map((track) => song.addTrack(track))
  song.selectedTrackId = 1
  song.timebase = midi.header.ticksPerBeat

  return song
}
