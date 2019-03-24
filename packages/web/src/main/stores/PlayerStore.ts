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

  @observable _position: number

  @computed get position(): number {
    return this._position
  }

  @action setPosition(position: number) {
    this.player.position = position
    this._position = position
  }

  constructor(player: Player) {
    this.player = player
    this._loop = player.loop
    this._position = player.position

    player.addListener(
      "change-position",
      position => (this._position = position)
    )
  }
}
