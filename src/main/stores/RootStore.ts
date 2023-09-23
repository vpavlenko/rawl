import { makeObservable, observable } from "mobx"
import Player from "../../common/player"
import Song, { emptySong } from "../../common/song"
import TrackMute from "../../common/trackMute"
import { SerializedState, pushHistory } from "../actions/history"
import { GroupOutput } from "../services/GroupOutput"
import { MIDIInput, previewMidiInput } from "../services/MIDIInput"
import { MIDIRecorder } from "../services/MIDIRecorder"
import { SoundFontSynth } from "../services/SoundFontSynth"
import ArrangeViewStore from "./ArrangeViewStore"
import { AuthStore } from "./AuthStore"
import { CloudFileStore } from "./CloudFileStore"
import { ControlStore } from "./ControlStore"
import { ExportStore } from "./ExportStore"
import HistoryStore from "./HistoryStore"
import { MIDIDeviceStore } from "./MIDIDeviceStore"
import PianoRollStore from "./PianoRollStore"
import RootViewStore from "./RootViewStore"
import Router from "./Router"
import SettingStore from "./SettingStore"
import { SoundFontStore } from "./SoundFontStore"
import TempoEditorStore from "./TempoEditorStore"
import { registerReactions } from "./reactions"

export default class RootStore {
  song: Song = emptySong()
  readonly router = new Router()
  readonly trackMute = new TrackMute()
  readonly historyStore = new HistoryStore<SerializedState>()
  readonly rootViewStore = new RootViewStore()
  readonly pianoRollStore: PianoRollStore
  readonly controlStore: ControlStore
  readonly arrangeViewStore = new ArrangeViewStore(this)
  readonly tempoEditorStore = new TempoEditorStore(this)
  readonly midiDeviceStore = new MIDIDeviceStore()
  readonly exportStore = new ExportStore()
  readonly authStore = new AuthStore()
  readonly cloudFileStore = new CloudFileStore(this)
  readonly settingStore = new SettingStore()
  readonly player: Player
  readonly synth: SoundFontSynth
  readonly metronomeSynth: SoundFontSynth
  readonly synthGroup = new GroupOutput()
  readonly midiInput = new MIDIInput()
  readonly midiRecorder: MIDIRecorder
  readonly soundFontStore: SoundFontStore

  constructor() {
    makeObservable(this, {
      song: observable.ref,
    })

    const context = new (window.AudioContext || window.webkitAudioContext)()
    this.synth = new SoundFontSynth(context)
    this.metronomeSynth = new SoundFontSynth(context)
    this.synthGroup.outputs.push({ synth: this.synth, isEnabled: true })

    this.player = new Player(
      this.synthGroup,
      this.metronomeSynth,
      this.trackMute,
      this,
    )
    this.midiRecorder = new MIDIRecorder(this.player, this)

    this.pianoRollStore = new PianoRollStore(this)
    this.controlStore = new ControlStore(this.pianoRollStore)
    this.soundFontStore = new SoundFontStore(this.synth)

    const preview = previewMidiInput(this)

    this.midiInput.onMidiMessage = (e) => {
      preview(e)
      this.midiRecorder.onMessage(e)
    }

    this.pianoRollStore.setUpAutorun()
    this.arrangeViewStore.setUpAutorun()
    this.tempoEditorStore.setUpAutorun()

    registerReactions(this)

    this.init()
  }

  private async init() {
    try {
      await this.synth.setup()
      await this.soundFontStore.init()
      this.setupMetronomeSynth()
    } catch (e) {
      this.rootViewStore.initializeError = e as Error
      this.rootViewStore.openInitializeErrorDialog = true
    }
  }

  private async setupMetronomeSynth() {
    const soundFontURL =
      "https://cdn.jsdelivr.net/gh/ryohey/signal@6959f35/public/A320U_drums.sf2"
    await this.metronomeSynth.setup()
    const data = await (await fetch(soundFontURL)).arrayBuffer()
    await this.metronomeSynth.loadSoundFont(data)
  }

  get pushHistory() {
    return pushHistory(this)
  }
}
