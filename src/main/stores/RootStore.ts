import { makeObservable, observable } from "mobx"
import Player from "../../common/player"
import Quantizer from "../../common/quantizer"
import Song, { emptySong } from "../../common/song"
import TrackMute from "../../common/trackMute"
import { SerializedState } from "../actions/history"
import { TIME_BASE } from "../Constants"
import { GroupOutput } from "../services/GroupOutput"
import IFrameSynth from "../services/IFrameSynth"
import { MIDIInput, midiInputPreview } from "../services/MIDIInput"
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
  midiInput: MIDIInput
}

export default class RootStore {
  song: Song = emptySong()
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
    makeObservable(this, {
      song: observable.ref,
    })

    const synth = new IFrameSynth("A320U.sf2")
    const synthGroup = new GroupOutput()
    synthGroup.outputs.push({ synth, isEnabled: true })

    const player = new Player(TIME_BASE, synthGroup, this.trackMute)
    player.song = this.song
    const quantizer = new Quantizer(TIME_BASE)
    const midiInput = new MIDIInput()
    this.services = { player, quantizer, synth, synthGroup, midiInput }
    this.pianoRollStore = new PianoRollStore()

    synth.onLoadSoundFont = (e) => {
      this.pianoRollStore.presetNames = e.presetNames
      player.reset()
    }

    midiInput.onMidiMessage = midiInputPreview(this)

    registerReactions(this)
  }
}
