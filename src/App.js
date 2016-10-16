import observable from "riot-observable"
import Player from "./services/Player"
import Quantizer from "./services/Quantizer"
import SharedService from "./services/SharedService"
import Song from "./model/Song"
import Config from "./Config"
import Downloader from "./helpers/Downloader"
import MidiFileReader from "./midi/MidiFileReader"
import MidiFileWriter from "./midi/MidiFileWriter"

export default class App {
  constructor() {
    observable(this)
    this._player = new Player(Config.TIME_BASE)
    SharedService.player = this._player

    this._quantizer = new Quantizer(Config.TIME_BASE)
    SharedService.quantizer = this._quantizer

    this.newSong()
  }

  open(file) {
    MidiFileReader.read(file, midi => {
      const song = Song.fromMidi(midi)
      song.name = file.name
      this.song = song
    })
    this.player.reset()
  }

  save() {
    const bytes = MidiFileWriter.write(this.song.getTracks())
    Downloader.downloadBlob(bytes, this.song.name, "application/octet-stream")
  }

  set song(song) {
    this._song = song
    this.player.song = song
    this.trigger("change-song", song)
  }

  get song() {
    return this._song
  }

  newSong() {
    this.song = Song.emptySong()
  }

  get player() {
    return this._player
  }

  get quantizer() {
    return this._quantizer
  }
}
