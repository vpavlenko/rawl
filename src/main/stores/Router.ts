import { observable } from "mobx"

export default class Router {
  @observable path = "/arrange"

  pushArrange() {
    this.path = "/arrange"
  }

  pushTrack() {
    this.path = `/track`
  }

  pushSettings() {
    this.path = "/settings"
  }
}
