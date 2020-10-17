import Player from "common/player"
import Quantizer from "common/quantizer"
import Song, { emptySong } from "common/song"
import TrackMute from "common/trackMute"
import { observable } from "mobx"
import { deserialize, serialize } from "serializr"
import SynthOutput from "services/SynthOutput"
import { TIME_BASE } from "../Constants"
import ArrangeViewStore from "./ArrangeViewStore"
import HistoryStore from "./HistoryStore"
import PianoRollStore from "./PianoRollStore"
import { registerReactions } from "./reactions"
import RootViewStore from "./RootViewStore"
import Router from "./Router"
import SettingsStore from "./SettingsStore"
import TempoEditorStore from "./TempoEditorStore"

export interface Services {
  player: Player
  quantizer: Quantizer
  synth: SynthOutput
}

// we use any for now. related: https://github.com/Microsoft/TypeScript/issues/1897
type Json = any

export default class RootStore {
  @observable.ref song: Song = emptySong()
  router = new Router()
  trackMute = new TrackMute()
  historyStore = new HistoryStore<Song>()
  settingsStore = new SettingsStore()
  rootViewStore = new RootViewStore()
  pianoRollStore: PianoRollStore
  arrangeViewStore = new ArrangeViewStore()
  tempoEditorStore = new TempoEditorStore()

  services: Services

  constructor() {
    const synth = new SynthOutput("A320U.sf2")
    const player = new Player(TIME_BASE, synth, this.trackMute)
    const quantizer = new Quantizer(TIME_BASE)
    this.services = { player, quantizer, synth }
    this.pianoRollStore = new PianoRollStore()

    synth.onLoadSoundFont = (e) => {
      this.pianoRollStore.presetNames = e.presetNames
      player.reset()
    }

    registerReactions(this)
  }

  private serializeUndoableState = (): Json => {
    return serialize(this.song)
  }

  private restoreState = (serializedState: Json) => {
    const song = deserialize(Song, serializedState)
    song.onDeserialized()
    this.song = song
  }

  pushHistory = () => {
    const state = this.serializeUndoableState()
    this.historyStore.push(state)
  }

  undo = () => {
    const currentState = this.serializeUndoableState()
    const nextState = this.historyStore.undo(currentState)
    if (nextState !== undefined) {
      this.restoreState(nextState)
    }
  }

  redo = () => {
    const currentState = this.serializeUndoableState()
    const nextState = this.historyStore.redo(currentState)
    if (nextState !== undefined) {
      this.restoreState(nextState)
    }
  }
}
