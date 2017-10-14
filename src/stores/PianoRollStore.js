import { extendObservable } from "mobx"

export default class PianoRollStore {
  constructor() {
    extendObservable(this, {
      scrollLeft: 0,
      scrollTop: 700, // 中央くらいの音程にスクロールしておく
      controlHeight: 0,
      cursorPosition: 0,
      notesCursor: "auto",
      controlMode: "velocity",
      mouseMode: 0,
      scaleX: 1,
      scaleY: 1,
      autoScroll: true,
      quantize: 0
    })
  }
}
