import { read as readBytes } from "./MidiFileReader"
import { write as writeBytes } from "./MidiFileWriter"
import Song from "../stores/Song"

const { remote } = window.require("electron")
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
    const song = Song.fromMidi(midi)
    song.filepath = file
    callback(null, song)
  })
}

export function write({ tracks }, filepath, callback) {
  const bytes = writeBytes(tracks)
  fs.writeFile(filepath, bytes, callback)
}
