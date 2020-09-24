import { observable, computed, action } from "mobx"
import Player, { LoopSetting } from "common/player"

export default class PlayerStore {
  private player: Player

  @observable private _position: number

  @computed get position(): number {
    return this._position
  }

  @action setPosition(position: number) {
    this.player.position = position
    this._position = position
  }

  constructor(player: Player) {
    this.player = player
    this._position = player.position

    player.addListener(
      "change-position",
      (position) => (this._position = position)
    )
  }
}
