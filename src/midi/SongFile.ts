import { read as readBytes } from "./MidiFileReader.ts"
import { write as writeBytes } from "./MidiFileWriter.ts"
import { songFromMidi } from "../stores/SongFactory.ts"

const { remote } = (window as any).require("electron")
const fs = remote.require("fs")

export function read(file, callback) {
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

export function write({ tracks }, filepath, callback) {
  const bytes = writeBytes(tracks)
  fs.writeFile(filepath, bytes, callback)
}
