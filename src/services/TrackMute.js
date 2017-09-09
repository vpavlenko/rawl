import _ from "lodash"
import EventEmitter from "eventemitter3"

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
export default class TrackMute extends EventEmitter {
  mutes = {}
  solos = {}

  reset() {
    this.mutes = {}
    this.solos = {}
    this.emit("change-mute")
  }

  _prepareMute(trackId) {
    if (this.mutes[trackId] === undefined) {
      this.mutes[trackId] = false
    }
  }

  _prepareSolo(trackId) {
    if (this.solos[trackId] === undefined) {
      this.solos[trackId] = false
    }
  }

  _setMute(trackId, isMute) {
    if (this.isSoloMode()) {
      return
    }
    this._prepareMute(trackId)
    this.mutes[trackId] = isMute
    this.emit("change-mute")
  }

  _getMute(trackId) {
    this._prepareMute(trackId)
    return this.mutes[trackId]
  }

  _setSolo(trackId, isSolo) {
    this._prepareSolo(trackId)
    this.solos[trackId] = isSolo
    this.emit("change-mute")
  }

  _getSolo(trackId) {
    this._prepareSolo(trackId)
    return this.solos[trackId]
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
