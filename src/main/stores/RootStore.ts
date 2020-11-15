import { cloneDeep } from "lodash"
import { observable } from "mobx"
import { deserialize, serialize } from "serializr"
import Player from "../../common/player"
import Quantizer from "../../common/quantizer"
import { Selection } from "../../common/selection/Selection"
import Song, { emptySong } from "../../common/song"
import TrackMute from "../../common/trackMute"
import { TIME_BASE } from "../Constants"
import { GroupOutput } from "../services/GroupOutput"
import IFrameSynth from "../services/IFrameSynth"
import ArrangeViewStore from "./ArrangeViewStore"
import HistoryStore from "./HistoryStore"
import { MIDIDeviceStore } from "./MIDIDeviceStore"
import PianoRollStore from "./PianoRollStore"
import { registerReactions } from "./reactions"
import RootViewStore from "./RootViewStore"
import Router from "./Router"
import SettingsStore from "./SettingsStore"
import TempoEditorStore from "./TempoEditorStore"

export interface Services {
  player: Player
  quantizer: Quantizer
  synth: IFrameSynth
  synthGroup: GroupOutput
}

// we use any for now. related: https://github.com/Microsoft/TypeScript/issues/1897
type Json = any

interface SerializedState {
  song: Json
  selection: Selection
}

export default class RootStore {
  @observable.ref song: Song = emptySong()
  router = new Router()
  trackMute = new TrackMute()
  historyStore = new HistoryStore<SerializedState>()
  settingsStore = new SettingsStore()
  rootViewStore = new RootViewStore()
  pianoRollStore: PianoRollStore
  arrangeViewStore = new ArrangeViewStore()
  tempoEditorStore = new TempoEditorStore()
  midiDeviceStore = new MIDIDeviceStore()

  services: Services

  constructor() {
    const synth = new IFrameSynth("A320U.sf2")
    const synthGroup = new GroupOutput()
    synthGroup.outputs.push({ synth, isEnabled: true })

    const player = new Player(TIME_BASE, synthGroup, this.trackMute)
    const quantizer = new Quantizer(TIME_BASE)
    this.services = { player, quantizer, synth, synthGroup }
    this.pianoRollStore = new PianoRollStore()

    synth.onLoadSoundFont = (e) => {
      this.pianoRollStore.presetNames = e.presetNames
      player.reset()
    }

    registerReactions(this)
  }

  private serializeUndoableState = (): SerializedState => {
    return {
      song: serialize(this.song),
      selection: cloneDeep(this.pianoRollStore.selection),
    }
  }

  private restoreState = (serializedState: SerializedState) => {
    const song = deserialize(Song, serializedState.song)
    song.onDeserialized()
    this.song = song
    this.pianoRollStore.selection = serializedState.selection
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
