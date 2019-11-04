import { write as writeBytes } from "./MidiFileWriter"
import Song, { songFromMidi } from "common/song"
import Track from "common/track"
import { Data } from "midifile-ts"
import Downloader from "../helpers/Downloader"

export function read(data: ArrayLike<number>): Song {
  return songFromMidi(data as Data<number>)
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
  Downloader.downloadBlob(blob, filepath, "audio/midi")
  callback(null)
}
