import { makeObservable, observable } from "mobx"

export type RoutePath = "/" | "/profile"

export default class Router {
  path: RoutePath = "/"

  constructor() {
    makeObservable(this, {
      path: observable,
    })
  }

  pushHome() {
    this.path = "/"
  }

  pushProfile() {
    this.path = "/profile"
  }
}
