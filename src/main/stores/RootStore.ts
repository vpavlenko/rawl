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
import { ExportStore } from "./ExportStore"
import HistoryStore from "./HistoryStore"
import { MIDIDeviceStore } from "./MIDIDeviceStore"
import PianoRollStore from "./PianoRollStore"
import { registerReactions } from "./reactions"
import RootViewStore from "./RootViewStore"
import Router from "./Router"
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
  rootViewStore = new RootViewStore()
  pianoRollStore: PianoRollStore
  arrangeViewStore = new ArrangeViewStore(this)
  tempoEditorStore = new TempoEditorStore(this)
  midiDeviceStore = new MIDIDeviceStore()
  exportStore = new ExportStore(this)

  services: Services

  constructor() {
    makeObservable(this, {
      song: observable.ref,
    })

    const synth = new SoundFontSynth(
      "https://cdn.jsdelivr.net/gh/ryohey/signal@4569a31/public/A320U.sf2"
    )
    const synthGroup = new GroupOutput()
    synthGroup.outputs.push({ synth, isEnabled: true })

    const player = new Player(synthGroup, this.trackMute, this)
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

    this.pianoRollStore.setUpAutorun()
    this.arrangeViewStore.setUpAutorun()
    this.tempoEditorStore.setUpAutorun()

    registerReactions(this)
  }
}
