import { StreamSource } from "midifile-ts"
import { toJS } from "mobx"
import { downloadBlob } from "../helpers/Downloader"
import Song, { songFromMidi } from "../song"
import { write as writeBytes } from "./MidiFileWriter"

export function read(data: ArrayLike<number>): Song {
  return songFromMidi(data as StreamSource)
}

export function songToMidi(song: Song) {
  return writeBytes(toJS(song.tracks), song.timebase)
}

export function write(song: Song) {
  const bytes = songToMidi(song)
  const blob = new Blob([bytes], { type: "application/octet-stream" })
  downloadBlob(blob, song.filepath ?? "no name.mid")
}
