import { makeObservable, observable } from "mobx"
import { ITrackMute } from "./ITrackMute"

function updated<T>(obj: T, key: keyof T, value: any) {
  return { ...obj, [key]: value }
}

type BoolMap = { [index: number]: boolean }

/**

  操作によって二つのモードが切り替わる

  ## mute モード

  単に mute/unmute でトラックの出力を OFF/ON にする
  solo とは独立してミュート設定を保持する

  ## solo モード

  何かのトラックを solo にした時にこのモードに遷移する
  指定トラック以外の全てのトラックを mute するが、
  追加で他のトラックを solo にしたときは
  そのトラックの mute を解除する (mute モードのミュート設定とは独立)

  すべてのトラックの solo が解除された時に
  mute モードに遷移する

*/
export default class TrackMute implements ITrackMute {
  private mutes: BoolMap = {}

  private solos: BoolMap = {}

  constructor() {
    makeObservable<TrackMute, "mutes" | "solos">(this, {
      mutes: observable,
      solos: observable,
    })
  }

  reset() {
    this.mutes = {}
    this.solos = {}
  }

  private _setMute(trackId: number, isMute: boolean) {
    if (this.isSoloMode()) {
      return
    }
    this.mutes = updated(this.mutes, trackId, isMute)
  }

  private _getMute(trackId: number) {
    return this.mutes[trackId] || false
  }

  private _setSolo(trackId: number, isSolo: boolean) {
    this.solos = updated(this.solos, trackId, isSolo)
  }

  private _getSolo(trackId: number) {
    return this.solos[trackId] || false
  }

  mute(trackId: number) {
    this._setMute(trackId, true)
  }

  unmute(trackId: number) {
    this._setMute(trackId, false)
  }

  solo(trackId: number) {
    this._setSolo(trackId, true)
  }

  unsolo(trackId: number) {
    this._setSolo(trackId, false)
  }

  isSoloMode(): boolean {
    // どれかひとつでも solo なら solo モード
    // Any one or Solo mode Solo mode
    return Object.values(this.solos).some((s) => s)
  }

  shouldPlayTrack(trackId: number) {
    if (this.isSoloMode()) {
      return this._getSolo(trackId)
    } else {
      return !this._getMute(trackId)
    }
  }

  // 表示用のメソッド
  // Method for display

  isSolo(trackId: number) {
    return this.isSoloMode() && this.solos[trackId]
  }

  isMuted(trackId: number) {
    return !this.shouldPlayTrack(trackId)
  }
}
