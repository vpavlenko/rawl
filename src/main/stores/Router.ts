import { observable } from "mobx"

export type RoutePath = "/track" | "/arrange" | "/settings" | "/tempo"

export default class Router {
  @observable path: RoutePath = "/track"

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
