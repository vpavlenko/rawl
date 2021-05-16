import {
  AnyEvent,
  read,
  StreamSource,
  write as writeMidiFile,
} from "midifile-ts"
import { toJS } from "mobx"
import { downloadBlob } from "../helpers/Downloader"
import { toRawEvents } from "../helpers/toRawEvents"
import { toTrackEvents } from "../helpers/toTrackEvents"
import Song from "../song"
import Track from "../track"

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
  const midi = read(data)

  midi.tracks.map(trackFromMidiEvents).map((track) => song.addTrack(track))
  song.selectedTrackId = 1
  song.timebase = midi.header.ticksPerBeat

  return song
}

const setChannel =
  (channel: number) =>
  (e: AnyEvent): AnyEvent => {
    if (e.type === "channel") {
      return { ...e, channel }
    }
    return e
  }

export function songToMidi(song: Song) {
  const tracks = toJS(song.tracks)
  const rawTracks = tracks.map((t) => {
    const rawEvents = toRawEvents(t.events)
    if (t.channel !== undefined) {
      return rawEvents.map(setChannel(t.channel))
    }
    return rawEvents
  })
  return writeMidiFile(rawTracks, song.timebase)
}

export function downloadSongAsMidi(song: Song) {
  const bytes = songToMidi(song)
  const blob = new Blob([bytes], { type: "application/octet-stream" })
  downloadBlob(blob, song.filepath ?? "no name.mid")
}
