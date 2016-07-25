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
        case 32: 
          const player = SharedService.player
          if (player.isPlaying) {
            player.stop()
          } else {
            player.play()
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
