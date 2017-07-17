import observable from "riot-observable"
import path from "path"
import Player from "./services/Player"
import Quantizer from "./services/Quantizer"
import Song from "./model/Song"
import Config from "./Config"
import Downloader from "./helpers/Downloader"
import MidiFileReader from "./midi/MidiFileReader"
import MidiFileWriter from "./midi/MidiFileWriter"
import MIDIOutput from "./services/MIDIOutput"

export default class App {
  constructor() {
    observable(this)
    this.player = new Player(Config.TIME_BASE, new MIDIOutput())
    this.quantizer = new Quantizer(Config.TIME_BASE)

    this.newSong()
  }

  open(file) {
    MidiFileReader.read(file, midi => {
      const song = Song.fromMidi(midi)
      song.filepath = file
      song.name = path.basename(file.replace(/\\/g, "/"))
      this.song = song
    })
  }

  save() {
    const bytes = MidiFileWriter.write(this.song.tracks)
    Downloader.downloadBlob(bytes, this.song.name, "application/octet-stream")
  }

  set song(song) {
    this._song = song
    this.player.song = song
    this.trigger("change-song", song)
    this.player.reset()
  }

  get song() {
    return this._song
  }

  newSong() {
    this.song = Song.emptySong()
  }
}
