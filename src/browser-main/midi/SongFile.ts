import { read as readBytes } from "./MidiFileReader"
import { write as writeBytes } from "./MidiFileWriter"
import { songFromMidi } from "common/song"
import Track from "common/track"

const { remote } = (window as any).require("electron")
const fs = remote.require("fs")

export function read(file: string, callback: (Error, Song?) => void) {
  fs.readFile(file, (e, data) => {
    if (e) {
      return callback(e)
    }
    let midi
    try {
      midi = readBytes(data)
    } catch (e) {
      return callback(e)
    }
    const song = songFromMidi(midi)
    song.filepath = file
    callback(null, song)
  })
}

interface TracksProvider {
  tracks: Track[]
}

export function write({ tracks }: TracksProvider, filepath: string, callback: (Error) => void) {
  const bytes = writeBytes(tracks)
  fs.writeFile(filepath, bytes, callback)
}
