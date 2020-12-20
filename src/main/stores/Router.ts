import { makeObservable, observable } from "mobx"

export type RoutePath = "/track" | "/arrange" | "/tempo"

export default class Router {
  path: RoutePath = "/track"

  constructor() {
    makeObservable(this, {
      path: observable,
    })
  }

  pushArrange() {
    this.path = "/arrange"
  }

  pushTrack() {
    this.path = `/track`
  }
}
