import observable from "riot-observable"
import Player from "./services/Player"
import Quantizer from "./services/Quantizer"
import Song from "./model/Song"
import Config from "./Config"
import Downloader from "./helpers/Downloader"
import { read as readSong, write as writeSong } from "./midi/SongFile"
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
    readSong(file, (e, song) => {
      if (e) {
        console.error(e)
      }
      this.song = song
    })
  }

  saveSong(filepath) {
    writeSong(this.song, filepath, e => {
      if (e) {
        console.error(e)
      }
    })
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
