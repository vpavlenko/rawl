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
import { TIME_BASE } from "./Constants"

import "./index.css"

export default class App {
  constructor() {
    observable(this)
    this.trackMute = new TrackMute()
    this.player = new Player(TIME_BASE, new SynthOutput(), this.trackMute)
    this.quantizer = new Quantizer(TIME_BASE)
    this.song = Song.emptySong()
  }

  init() {
    document.app = this // for debug

    const RootView2 = withSong(this, RootView)
    const dispatch = createDispatcher(this)

    ReactDOM.render(<RootView2
      app={this}
      dispatch={dispatch}
    />, document.querySelector("#root"))
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
}
