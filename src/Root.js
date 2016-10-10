import React, { Component } from "react"
import SharedService from "./services/SharedService"
import Player from "./services/Player"
import Quantizer from "./services/Quantizer"
import RootView from "./components/RootView"
import Song from "./model/Song"
import MidiFileReader from "./midi/MidiFileReader"
import MidiFileWriter from "./midi/MidiFileWriter"
import Config from "./Config"
import Downloader from "./helpers/Downloader"

export default class Root extends Component {
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
          e.preventDefault()
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
