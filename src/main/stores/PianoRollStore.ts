import { action, makeObservable, observable } from "mobx"
import { emptySelection } from "../../common/selection/Selection"
import { LoadSoundFontEvent } from "../../synth/synth"
import { ControlMode } from "../components/ControlPane/ControlPane"
import { InstrumentSetting } from "../components/InstrumentBrowser/InstrumentBrowser"

export type PianoRollMouseMode = "pencil" | "selection"

// trackId to trackId[] (not contains itself)
type GhostTrackIdMap = { [index: number]: number[] }

export default class PianoRollStore {
  scrollLeft = 0
  scrollTop = 700 // 中央くらいの音程にスクロールしておく
  controlHeight = 0
  notesCursor = "auto"
  controlMode: ControlMode = "velocity"
  mouseMode: PianoRollMouseMode = "pencil"
  scaleX = 1
  scaleY = 1
  autoScroll = true
  quantize = 0
  selection = emptySelection
  lastNoteDuration: number | null = null
  openInstrumentBrowser = false
  instrumentBrowserSetting: InstrumentSetting = {
    isRhythmTrack: false,
    programNumber: 0,
  }
  presetNames: LoadSoundFontEvent["presetNames"] = [[]]
  ghostTracks: GhostTrackIdMap = {}

  constructor() {
    makeObservable(this, {
      scrollLeft: observable,
      scrollTop: observable,
      controlHeight: observable,
      notesCursor: observable,
      controlMode: observable,
      mouseMode: observable,
      scaleX: observable,
      scaleY: observable,
      autoScroll: observable,
      quantize: observable,
      selection: observable,
      lastNoteDuration: observable,
      openInstrumentBrowser: observable,
      instrumentBrowserSetting: observable,
      presetNames: observable,
      ghostTracks: observable,
      scrollBy: action,
      toggleTool: action,
    })
  }

  scrollBy(x: number, y: number) {
    this.scrollLeft = Math.max(0, this.scrollLeft - x)
    this.scrollTop = Math.max(0, this.scrollTop - y)
  }

  toggleTool() {
    this.mouseMode === "pencil" ? "selection" : "pencil"
  }
}
