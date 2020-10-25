import SelectionModel from "common/selection"
import { action, observable } from "mobx"
import { LoadSoundFontEvent } from "src/synth/synth"
import { ControlMode } from "../components/ControlPane/ControlPane"
import { InstrumentSetting } from "../components/InstrumentBrowser/InstrumentBrowser"

export type PianoRollMouseMode = "pencil" | "selection"

// trackId to trackId[] (not contains itself)
type GhostTrackIdMap = { [index: number]: number[] }

export default class PianoRollStore {
  @observable scrollLeft = 0
  @observable scrollTop = 700 // 中央くらいの音程にスクロールしておく
  @observable controlHeight = 0
  @observable notesCursor = "auto"
  @observable controlMode: ControlMode = "velocity"
  @observable mouseMode: PianoRollMouseMode = "pencil"
  @observable scaleX = 1
  @observable scaleY = 1
  @observable autoScroll = true
  @observable quantize = 0
  @observable selection = new SelectionModel()
  @observable lastNoteDuration: number | null = null
  @observable openInstrumentBrowser = false
  @observable instrumentBrowserSetting: InstrumentSetting = {
    isRhythmTrack: false,
    programNumber: 0,
  }
  @observable presetNames: LoadSoundFontEvent["presetNames"] = [[]]
  @observable ghostTracks: GhostTrackIdMap = {}

  @action scrollBy(x: number, y: number) {
    this.scrollLeft = Math.max(0, this.scrollLeft - x)
    this.scrollTop = Math.max(0, this.scrollTop - y)
  }

  @action toggleTool() {
    this.mouseMode === "pencil" ? "selection" : "pencil"
  }
}
