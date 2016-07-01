"use strict"
const SharedService = {}

const MAX_NOTE_NUMBER = 127
const KEY_HEIGHT = 14
const PIXELS_PER_BEAT = 23
const TIME_BASE = 480

class App {
  constructor() {
    this.emitter = {}
    riot.observable(this.emitter)
    this.initServices()
    this.initRootView()
  }

  initServices() {
    SharedService.player = new Player(TIME_BASE)
    SharedService.quantizer = new Quantizer(PIXELS_PER_BEAT, KEY_HEIGHT)
    SharedService.coordConverter = new NoteCoordConverter(PIXELS_PER_BEAT, KEY_HEIGHT, [
      { tempo: 120, tick: 0 },
    ], TIME_BASE, MAX_NOTE_NUMBER)
  }

  initRootView() {
    this.view = new RootView()
    this.view.emitter.on("change-file", file => this.openSong(file))
    this.view.emitter.on("change-quantize", denominator => SharedService.quantizer.denominator = denominator)
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
