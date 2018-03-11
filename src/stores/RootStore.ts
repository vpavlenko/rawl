import { observable } from "mobx"
import { serialize, deserialize } from "serializr"

import Song from "./Song.ts"
import Router from "./Router.ts"
import TrackMute from "./TrackMute.ts"
import PlayerStore from "./PlayerStore.ts"
import HistoryStore from "./HistoryStore.ts"
import SettingsStore from "./SettingsStore.ts"
import RootViewStore from "./RootViewStore.ts"
import PianoRollStore from "./PianoRollStore.ts"
import ArrangeViewStore from "./ArrangeViewStore.ts"
import TempoEditorStore from "./TempoEditorStore.ts"

import Player from "../services/Player.ts"
import Quantizer from "../services/Quantizer.ts"
import SynthOutput from "../services/SynthOutput.ts"
import { TIME_BASE } from "../Constants"

import createDispatcher from "../createDispatcher"
import { emptySong } from "./SongFactory.ts"

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

  services = {}

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