import { observable } from "mobx"
import _ from "lodash"

function updated(obj, key, value) {
  return { ...obj, [key]: value }
}

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
export default class TrackMute {
  @observable mutes = {}
  @observable solos = {}

  reset() {
    this.mutes = {}
    this.solos = {}
  }

  _setMute(trackId, isMute) {
    if (this.isSoloMode()) {
      return
    }
    this.mutes = updated(this.mutes, trackId, isMute)
  }

  _getMute(trackId) {
    return this.mutes[trackId] || false
  }

  _setSolo(trackId, isSolo) {
    this.solos = updated(this.solos, trackId, isSolo)
  }

  _getSolo(trackId) {
    return this.solos[trackId] || false
  }

  mute(trackId) {
    this._setMute(trackId, true)
  }

  unmute(trackId) {
    this._setMute(trackId, false)
  }

  solo(trackId) {
    this._setSolo(trackId, true)
  }

  unsolo(trackId) {
    this._setSolo(trackId, false)
  }

  isSoloMode() {
    // どれかひとつでも solo なら solo モード
    return _.some(this.solos)
  }

  shouldPlayTrack(trackId) {
    if (this.isSoloMode()) {
      return this._getSolo(trackId)
    } else {
      return !this._getMute(trackId)
    }
  }

  // 表示用のメソッド

  isSolo(trackId) {
    return this.isSoloMode() && this.solos[trackId]
  }

  isMuted(trackId) {
    return !this.shouldPlayTrack(trackId)
  }
}
