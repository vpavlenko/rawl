import { observable } from "mobx"
import SelectionModel from "common/selection"
import SynthOutput from "../services/SynthOutput"
import { LoadSoundFontEvent } from "src/synth/synth"
import { InstrumentSetting } from "../components/InstrumentBrowser/InstrumentBrowser"
import { ControlMode } from "../components/PianoRoll/ControlPane"

export type PianoRollMouseMode = "pencil" | "selection"

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

  constructor(synth: SynthOutput) {
    synth.onLoadSoundFont = (e) => {
      this.presetNames = e.presetNames
    }
  }
}
