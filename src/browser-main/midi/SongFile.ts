import { read as readBytes } from "./MidiFileReader"
import { write as writeBytes } from "./MidiFileWriter"
import Song, { songFromMidi } from "common/song"
import Track from "common/track"

export function read(data: ArrayLike<number>): Song {
  return songFromMidi(readBytes(data))
}

interface TracksProvider {
  tracks: Track[]
}

export function write({ tracks }: TracksProvider, filepath: string, callback: (Error) => void) {
  const bytes = writeBytes(tracks)
  // fs.writeFile(filepath, bytes, callback)
}
