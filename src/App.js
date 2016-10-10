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
    SharedService.player = new Player(Config.TIME_BASE)
    SharedService.quantizer = new Quantizer(Config.TIME_BASE)

    this.newSong()
  }

  open(file) {
    MidiFileReader.read(file, midi => {
      const song = Song.fromMidi(midi)
      song.name = file.name
      this.song = song
    })
    SharedService.player.reset()
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
    return SharedService.player
  }
}
