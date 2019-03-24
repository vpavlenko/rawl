import { observable, computed, action } from "mobx"
import Player, { LoopSetting } from "common/player"

export default class PlayerStore {
  private player: Player

  @observable _loop: LoopSetting

  @computed get loop(): LoopSetting {
    return this._loop
  }

  // Player の状態と同期させるために必ず action 経由で変更すること
  @action setLoop(loop: LoopSetting) {
    this._loop = loop
    this.player.loop = loop
  }

  constructor(player: Player) {
    this.player = player
  }
}
