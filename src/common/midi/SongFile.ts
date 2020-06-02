import { write as writeBytes } from "./MidiFileWriter"
import Song, { songFromMidi } from "common/song"
import Track from "common/track"
import { StreamSource } from "midifile-ts"
import { downloadBlob } from "../helpers/Downloader"

export function read(data: ArrayLike<number>): Song {
  return songFromMidi(data as StreamSource)
}

export function write(tracks: Track[], filepath: string) {
  const bytes = writeBytes(tracks)
  const blob = new Blob([bytes], { type: "application/octet-stream" })
  downloadBlob(blob, filepath ?? "no name.mid")
}
