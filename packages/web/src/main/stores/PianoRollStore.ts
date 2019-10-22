import { observable } from "mobx"
import SelectionModel from "common/selection"
import Player from "src/common/player"
import SynthOutput from "../services/SynthOutput"
import { LoadSoundFontEvent } from "src/synth/synth"

export type PianoRollMouseMode = "pencil" | "selection"

export default class PianoRollStore {
  @observable scrollLeft = 0
  @observable scrollTop = 700 // 中央くらいの音程にスクロールしておく
  @observable controlHeight = 0
  @observable cursorPosition = 0
  @observable notesCursor = "auto"
  @observable controlMode = "velocity"
  @observable mouseMode: PianoRollMouseMode = "pencil"
  @observable scaleX = 1
  @observable scaleY = 1
  @observable autoScroll = true
  @observable quantize = 0
  @observable selection = new SelectionModel()
  @observable lastNoteDuration: number | null = null
  @observable openInstrumentBrowser = false
  @observable presetNames: LoadSoundFontEvent["presetNames"] = [[]]

  constructor(player: Player, synth: SynthOutput) {
    player.addListener(
      "change-position",
      position => (this.cursorPosition = position)
    )
    synth.onLoadSoundFont = e => {
      this.presetNames = e.presetNames
    }
  }
}
