"use strict"
const SharedService = {}

class App {
  constructor() {
    this.emitter = {}
    riot.observable(this.emitter)
    this.initServices()
    this.initRootView()
  }

  initServices() {
    SharedService.player = new Player(TIME_BASE)
    SharedService.quantizer = new Quantizer(TIME_BASE)
  }

  initRootView() {
    this.view = new RootView()
    this.view.emitter.on("change-file", file => this.openSong(file))
    this.view.emitter.on("view-did-load", () => this.onLoadView())
  }

  onLoadView() {
    this.setSong(Song.emptySong())
  }

  setSong(song) {
    this.song = song
    this.view.setSong(song)
  }

  openSong(file) {
    MidiFileReader.read(file, midi => {
      this.setSong(Song.fromMidi(midi))
    })
  }
}
