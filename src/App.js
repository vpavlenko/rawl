import React from "react"
import ReactDOM from "react-dom"
import EventEmitter from "eventemitter3"
import { Provider } from "mobx-react"

import RootView from "./components/RootView"
import withSong from "./hocs/withSong"
import withTheme from "./hocs/withTheme"
import createDispatcher from "./createDispatcher"

import Player from "./services/Player"
import Quantizer from "./services/Quantizer"
import SynthOutput from "./services/SynthOutput"
import TrackMute from "./services/TrackMute"
import History from "./services/History"
import { bindKeyboardShortcut } from "./services/KeyboardShortcut"

import Song from "./model/Song"
import SelectionModel from "./model/SelectionModel"

import PianoRollStore from "./stores/PianoRollStore"
import RootViewStore from "./stores/RootViewStore"

import { TIME_BASE } from "./Constants"

import "./index.css"

export default class App extends EventEmitter {
  state = {}

  constructor() {
    super()
    this.trackMute = new TrackMute()
    this.player = new Player(TIME_BASE, new SynthOutput(), this.trackMute)
    this.quantizer = new Quantizer(TIME_BASE)
    this.song = Song.emptySong()
    this.pianoSelection = new SelectionModel()
  }

  init() {
    document.app = this // for debug

    const RootView2 = withTheme(withSong(this, RootView))
    const history = new History(this)
    const dispatch = createDispatcher(this, history)
    const pianoRollStore = new PianoRollStore()
    const rootViewStore = new RootViewStore()

    bindKeyboardShortcut(dispatch, this.player)

    ReactDOM.render(
      <Provider
        pianoRollStore={pianoRollStore}
        rootViewStore={rootViewStore}>
        <RootView2
          app={this}
          dispatch={dispatch}
        />
      </Provider>
      , document.querySelector("#root"))
  }

  set song(song) {
    this.setState({ song })
    this.player.song = song
    this.emit("change-song", song)
    this.player.reset()
    this.trackMute.reset()
  }

  get song() {
    return this.state.song
  }

  set pianoSelection(pianoSelection) {
    this.setState({ pianoSelection })
    this.emit("change-piano-selection", pianoSelection)
  }

  get pianoSelection() {
    return this.state.pianoSelection
  }

  setState(state) {
    this.state = { ...this.state, ...state }
  }
}
