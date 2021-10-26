import { makeObservable, observable } from "mobx"
import Player from "../../common/player"
import Song, { emptySong } from "../../common/song"
import TrackMute from "../../common/trackMute"
import { SerializedState } from "../actions/history"
import { GroupOutput } from "../services/GroupOutput"
import { MIDIInput, previewMidiInput } from "../services/MIDIInput"
import { MIDIRecorder } from "../services/MIDIRecorder"
import { SoundFontSynth } from "../services/SoundFontSynth"
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
  synth: SoundFontSynth
  synthGroup: GroupOutput
  midiInput: MIDIInput
  midiRecorder: MIDIRecorder
}

export default class RootStore {
  song: Song = emptySong()
  router = new Router()
  trackMute = new TrackMute()
  historyStore = new HistoryStore<SerializedState>()
  settingsStore: SettingsStore
  rootViewStore = new RootViewStore()
  pianoRollStore: PianoRollStore
  arrangeViewStore = new ArrangeViewStore(this)
  tempoEditorStore = new TempoEditorStore(this)
  midiDeviceStore = new MIDIDeviceStore()

  services: Services

  constructor() {
    makeObservable(this, {
      song: observable.ref,
    })

    const synth = new SoundFontSynth("A320U.sf2")
    const synthGroup = new GroupOutput()

    const player = new Player(synth, this.trackMute, this)
    const midiInput = new MIDIInput()
    const midiRecorder = new MIDIRecorder(player, this)
    this.services = {
      player,
      synth,
      synthGroup,
      midiInput,
      midiRecorder,
    }
    this.pianoRollStore = new PianoRollStore(this)

    const preview = previewMidiInput(this)

    midiInput.onMidiMessage = (e) => {
      preview(e)
      midiRecorder.onMessage(e)
    }

    this.settingsStore = new SettingsStore((settings) => {
      this.midiDeviceStore.enabledInputIds = new Set(settings.midiInputIds)
      this.midiDeviceStore.enabledOutputIds = new Set(settings.midiOutputIds)
    })

    this.pianoRollStore.setUpAutorun()
    this.arrangeViewStore.setUpAutorun()
    this.tempoEditorStore.setUpAutorun()

    registerReactions(this)
  }
}
