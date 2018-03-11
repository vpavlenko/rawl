import { observable } from "mobx"
import { serialize, deserialize } from "serializr"

import Song from "./Song"
import Router from "./Router"
import TrackMute from "./TrackMute"
import PlayerStore from "./PlayerStore"
import HistoryStore from "./HistoryStore"
import SettingsStore from "./SettingsStore"
import RootViewStore from "./RootViewStore"
import PianoRollStore from "./PianoRollStore"
import ArrangeViewStore from "./ArrangeViewStore"
import TempoEditorStore from "./TempoEditorStore"

import Player from "services//Player"
import Quantizer from "services//Quantizer"
import SynthOutput from "services//SynthOutput"
import { TIME_BASE } from "../Constants"

import createDispatcher from "../createDispatcher"
import { emptySong } from "./SongFactory"

interface Services {
  player: Player
  quantizer: Quantizer
  synth: SynthOutput
}

export default class RootStore {
  @observable.ref song: Song = emptySong()
  router = new Router()
  trackMute = new TrackMute()
  playerStore = new PlayerStore()
  historyStore = new HistoryStore()
  settingsStore = new SettingsStore()
  rootViewStore = new RootViewStore()
  pianoRollStore = new PianoRollStore()
  arrangeViewStore = new ArrangeViewStore()
  tempoEditorStore = new TempoEditorStore()

  services: Services

  constructor() {
    const { soundFontPath } = this.settingsStore
    if (!soundFontPath) {
      alert("Please set SoundFont from setting screen")
    }
    const synth = new SynthOutput(soundFontPath)
    const player = new Player(TIME_BASE, synth, this.trackMute)
    const quantizer = new Quantizer(TIME_BASE)
    this.services = { player, quantizer, synth }
  }

  get dispatch() {
    return createDispatcher(this)
  }

  serializeUndoableState() {
    return serialize(this.song)
  }

  restoreState(serializedState) {
    const song = deserialize(Song, serializedState)
    song.onDeserialized()
    this.song = song
  }

  pushHistory() {
    const state = this.serializeUndoableState()
    this.historyStore.push(state)
  }

  undo() {
    const currentState = this.serializeUndoableState()
    const nextState = this.historyStore.undo(currentState)
    if (nextState) {
      this.restoreState(nextState)
    }
  }

  redo() {
    const currentState = this.serializeUndoableState()
    const nextState = this.historyStore.redo(currentState)
    this.restoreState(nextState)
  }
}