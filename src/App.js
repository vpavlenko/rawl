import React from "react"
import ReactDOM from "react-dom"
import observable from "riot-observable"

import RootView from "./components/RootView"
import withSong from "./hocs/withSong"
import createDispatcher from "./createDispatcher"

import Player from "./services/Player"
import Quantizer from "./services/Quantizer"
import SynthOutput from "./services/SynthOutput"
import TrackMute from "./services/TrackMute"

import Song from "./model/Song"
import Config from "./Config"
import { read as readSong, write as writeSong } from "./midi/SongFile"

import "./index.css"

export default class App {
  constructor() {
    observable(this)
    this.trackMute = new TrackMute()
    this.player = new Player(Config.TIME_BASE, new SynthOutput(), this.trackMute)
    this.quantizer = new Quantizer(Config.TIME_BASE)

    this.newSong()
  }

  init() {
    document.app = this // for debug

    const RootView2 = withSong(this, RootView)

    ReactDOM.render(<RootView2
      app={this}
      dispatch={createDispatcher(this)}
    />, document.querySelector("#root"))
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
