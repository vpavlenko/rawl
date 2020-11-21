import { makeObservable, observable } from "mobx"

export default class TempoEditorStore {
  scrollLeft: number = 0
  scaleX: number = 1
  autoScroll: boolean = true

  constructor() {
    makeObservable(this, {
      scrollLeft: observable,
      scaleX: observable,
      autoScroll: observable,
    })
  }
}
