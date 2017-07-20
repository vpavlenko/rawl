import path from "path"
import { read as readBytes } from "./MidiFileReader"
import { write as writeBytes } from "./MidiFileWriter"
import Song from "../model/Song"

const { remote } = window.require("electron")
const fs = remote.require("fs")

export function read(file, callback) {
  fs.readFile(file, (e, data) => {
    const midi = readBytes(data)
    const song = Song.fromMidi(midi)
    song.filepath = file
    song.name = path.basename(file.replace(/\\/g, "/"))
    callback(e, song)
  })
}

export function write({ tracks }, filepath, callback) {
  const bytes = writeBytes(tracks)
  fs.writeFile(filepath, bytes, callback)
}
