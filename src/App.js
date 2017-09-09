import React from "react"
import ReactDOM from "react-dom"
import EventEmitter from "eventemitter3"

import RootView from "./components/RootView"
import withSong from "./hocs/withSong"
import createDispatcher from "./createDispatcher"

import Player from "./services/Player"
import Quantizer from "./services/Quantizer"
import SynthOutput from "./services/SynthOutput"
import TrackMute from "./services/TrackMute"
import History from "./services/History"

import Song from "./model/Song"
import { TIME_BASE } from "./Constants"

import "./index.css"

export default class App extends EventEmitter {
  constructor() {
    super()
    this.trackMute = new TrackMute()
    this.player = new Player(TIME_BASE, new SynthOutput(), this.trackMute)
    this.quantizer = new Quantizer(TIME_BASE)
    this.song = Song.emptySong()
    this.state = {}
  }

  init() {
    document.app = this // for debug

    const RootView2 = withSong(this, RootView)
    const history = new History(this)
    const dispatch = createDispatcher(this, history)

    ReactDOM.render(<RootView2
      app={this}
      dispatch={dispatch}
    />, document.querySelector("#root"))
  }

  set song(song) {
    this._song = song
    this.player.song = song
    this.emit("change-song", song)
    this.player.reset()
    this.trackMute.reset()
  }

  get song() {
    return this._song
  }
}
