import { write as writeBytes } from "./MidiFileWriter"
import Song, { songFromMidi } from "common/song"
import Track from "common/track"
import { Data } from "@signal-app/midifile-ts/src/stream"

export function read(data: ArrayLike<number>): Song {
  return songFromMidi(data as Data<number>)
}

interface TracksProvider {
  tracks: Track[]
}

export function write(
  { tracks }: TracksProvider,
  filepath: string,
  callback: (e: Error) => void
) {
  const bytes = writeBytes(tracks)
  // fs.writeFile(filepath, bytes, callback)
}
