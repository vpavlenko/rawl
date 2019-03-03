import { observable } from "mobx"

export default class PlayerStore {
  // Player の状態と同期させるために必ず action 経由で変更すること
  @observable loop = {
    start: null,
    end: null,
    enabled: false
  }
}
