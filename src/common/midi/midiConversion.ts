import groupBy from "lodash/groupBy"
import {
  AnyEvent,
  MidiFile,
  read,
  StreamSource,
  write as writeMidiFile,
} from "midifile-ts"
import { toJS } from "mobx"
import { downloadBlob } from "../helpers/Downloader"
import { assemble } from "../helpers/noteAssembler"
import { toRawEvents } from "../helpers/toRawEvents"
import {
  addTick,
  removeUnnecessaryProps,
  toTrackEvents,
} from "../helpers/toTrackEvents"
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

const tracksFromFormat0Events = (events: AnyEvent[]): Track[] => {
  const tickedEvents = addTick(events)
  const eventsPerChannel = groupBy(tickedEvents, (e) => {
    if ("channel" in e) {
      return e.channel + 1
    }
    return 0 // conductor track
  })
  const tracks: Track[] = []
  for (const channel of Object.keys(eventsPerChannel)) {
    const events = eventsPerChannel[channel]
    const ch = parseInt(channel)
    while (tracks.length <= ch) {
      const track = new Track()
      track.channel = ch > 0 ? ch - 1 : undefined
      tracks.push(track)
    }
    const track = tracks[ch]
    const trackEvents = assemble(events).map(removeUnnecessaryProps)
    track.addEvents(trackEvents)
  }
  return tracks
}

const getTracks = (midi: MidiFile): Track[] => {
  switch (midi.header.formatType) {
    case 0:
      return tracksFromFormat0Events(midi.tracks[0])
    case 1:
      return midi.tracks.map(trackFromMidiEvents)
    default:
      throw new Error(`Unsupported midi format ${midi.header.formatType}`)
  }
}

export function songFromMidi(data: StreamSource) {
  const song = new Song()
  const midi = read(data)

  getTracks(midi).forEach((t) => song.addTrack(t))

  if (midi.header.formatType === 1 && song.tracks.length > 0) {
    // Use the first track name as the song title
    const name = song.tracks[0].name
    if (name !== undefined) {
      song.name = name
    }
  }

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
  downloadBlob(blob, song.filepath.length > 0 ? song.filepath : "no name.mid")
}
