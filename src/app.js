import riot from "riot"
import SharedService from "./shared-service"
import Player from "./player"
import Quantizer from "./quantizer"
import RootView from "./view/root-view"
import Song from "./model/song"
import MidiFileReader from "./midi-file-reader"
import MidiWriter from "./midiwriter"
import Config from "./config"
import Downloader from "./downloader"

export default class App {
  constructor() {
    this.emitter = {}
    riot.observable(this.emitter)
    this.initServices()
    this.initRootView()
  }

  initServices() {
    SharedService.player = new Player(Config.TIME_BASE)
    SharedService.quantizer = new Quantizer(Config.TIME_BASE)
  }

  initRootView() {
    this.view = new RootView()
    this.view.emitter.on("change-file", file => this.openSong(file))
    this.view.emitter.on("save-file", file => this.saveSong())
    this.view.emitter.on("view-did-load", () => this.onLoadView())
  }

  onLoadView() {
    this.setSong(Song.emptySong())
    this.initKeyboardShortcut()
  }

  initKeyboardShortcut() {
    document.onkeydown = e => {
      if (e.target != document.body) {
        return
      }
      switch(e.keyCode) {
        case 32: {
          const player = SharedService.player
          if (player.isPlaying) {
            player.stop()
          } else {
            player.play()
          }
          break
        }
      }
    }
  }

  setSong(song) {
    this.song = song
    this.view.setSong(song)
  }

  openSong(file) {
    MidiFileReader.read(file, midi => {
      const song = Song.fromMidi(midi)
      song.name = file.name
      this.setSong(song)
    })
    SharedService.player.reset()
  }

  saveSong() {
    const bytes = MidiWriter.write(this.song.getTracks())
    Downloader.downloadBlob(bytes, this.song.name, "application/octet-stream")
  }
}
