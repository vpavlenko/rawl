import { observable } from "mobx"
import { LoopSetting } from "src/common/player"

export default class PlayerStore {
  // Player の状態と同期させるために必ず action 経由で変更すること
  @observable loop: LoopSetting = {
    begin: null,
    end: null,
    enabled: false
  }
}
