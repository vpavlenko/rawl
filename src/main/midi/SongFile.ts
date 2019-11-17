import { write as writeBytes } from "./MidiFileWriter"
import Song, { songFromMidi } from "common/song"
import Track from "common/track"
import { StreamSource } from "midifile-ts"
import { downloadBlob } from "../helpers/Downloader"

export function read(data: ArrayLike<number>): Song {
  return songFromMidi(data as StreamSource)
}

interface TracksProvider {
  tracks: Track[]
}

export function write(
  { tracks }: TracksProvider,
  filepath: string,
  callback: (e: Error | null) => void
) {
  const bytes = writeBytes(tracks)
  const blob = new Blob([bytes], { type: "application/octet-binary" })
  downloadBlob(blob, filepath, "audio/midi")
  callback(null)
}
