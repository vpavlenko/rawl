import { SongStore } from "../../main/stores/SongStore"
import { getMeasureStart } from "../song/selector"

export default class Quantizer {
  private denominator: number
  private songStore: SongStore
  private isEnabled: boolean = true

  constructor(songStore: SongStore, denominator: number, isEnabled: boolean) {
    this.songStore = songStore

    // N 分音符の N
    // n-remnant note n
    this.denominator = denominator

    this.isEnabled = isEnabled
  }

  private get timebase() {
    return this.songStore.song.timebase
  }

  private calc(tick: number, fn: (tick: number) => number) {
    if (!this.isEnabled) {
      return Math.round(tick)
    }
    const measureStart = getMeasureStart(this.songStore.song, tick)
    const beats =
      this.denominator === 1 ? measureStart?.timeSignature.numerator ?? 4 : 4
    const u = (this.timebase * beats) / this.denominator
    const offset = measureStart?.tick ?? 0
    return fn((tick - offset) / u) * u + offset
  }

  round(tick: number) {
    return this.calc(tick, Math.round)
  }

  ceil(tick: number) {
    return this.calc(tick, Math.ceil)
  }

  floor(tick: number) {
    return this.calc(tick, Math.floor)
  }

  get unit() {
    return (this.timebase * 4) / this.denominator
  }
}
