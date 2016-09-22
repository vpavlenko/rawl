import React, { Component } from "react"
import SharedService from "./shared-service"
import Player from "./player"
import Quantizer from "./quantizer"
import RootView from "./components/root-view"
import Song from "./model/song"
import MidiFileReader from "./midi-file-reader"
import MidiFileWriter from "./midi-file-writer"
import Config from "./config"
import Downloader from "./downloader"
import observable from "riot-observable"

export default class App extends Component {
  constructor(props) {
    super(props)

    this.initServices()
    this.initKeyboardShortcut()

    this.state = {
      song: Song.emptySong()
    }
    this.watchSong(this.state.song)
  }

  initServices() {
    SharedService.player = new Player(Config.TIME_BASE)
    SharedService.quantizer = new Quantizer(Config.TIME_BASE)
    window.SharedService = SharedService
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

  watchSong(song) {
    SharedService.player.prepare(song)

    song.on("change", () => {
      this.setState({ song })
    })
  }

  setSong(song) {
    if (!song || song === this.state.song) {
      return
    }

    this.setState({song})
    this.watchSong(song)
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
    const bytes = MidiFileWriter.write(this.song.getTracks())
    Downloader.downloadBlob(bytes, this.song.name, "application/octet-stream")
  }

  render() {
    return <RootView
      onChangeFile={file => this.openSong(file)}
      onSaveFile={() => this.saveSong()}
      song={this.state.song}
    />
  }
}
