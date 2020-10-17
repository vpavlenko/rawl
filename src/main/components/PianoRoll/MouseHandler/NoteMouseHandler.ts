import PianoRollStore from "main/stores/PianoRollStore"
import RootStore from "main/stores/RootStore"
import { PianoNotesMouseEvent } from "../PianoRollStage"
import { observeDrag } from "./observeDrag"

export type MouseAction = (e: PianoNotesMouseEvent) => void

export type MouseGesture = (
  onMouseDown: (action: MouseAction) => void,
  onMouseMove: (action: MouseAction) => void,
  onMouseUp: (action: MouseAction) => void
) => void

export default class NoteMouseHandler {
  protected readonly rootStore: RootStore
  private action: MouseGesture | null
  private actionMouseMove: MouseAction
  private actionMouseUp: MouseAction

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore
    this.onMouseDown = this.onMouseDown.bind(this)
    this.onMouseMove = this.onMouseMove.bind(this)
    this.onMouseUp = this.onMouseUp.bind(this)
  }

  // mousedown 以降に行う MouseAction を返す
  protected actionForMouseDown(e: PianoNotesMouseEvent): MouseGesture | null {
    // 共通の action

    // wheel drag to start scrolling
    if (e.nativeEvent.button === 1) {
      return dragScrollAction(this.rootStore.pianoRollStore)
    }

    // 右ダブルクリック
    if (e.nativeEvent.button === 2 && e.nativeEvent.detail % 2 === 0) {
      return changeToolAction(this.rootStore.pianoRollStore)
    }

    // サブクラスで残りを実装
    return null
  }

  protected getCursorForMouseMove(ev: PianoNotesMouseEvent): string {
    // サブクラスで実装
    return "auto"
  }

  onMouseDown(e: PianoNotesMouseEvent) {
    this.action = this.actionForMouseDown(e)
    if (!this.action) {
      return
    }
    this.actionMouseMove = () => {}
    this.actionMouseUp = () => {}
    this.action(
      (mouseDown) => mouseDown(e),
      (f) => (this.actionMouseMove = f),
      (f) => (this.actionMouseUp = f)
    )
  }

  onMouseMove(e: PianoNotesMouseEvent) {
    if (this.action) {
      this.actionMouseMove(e)
    } else {
      const cursor = this.getCursorForMouseMove(e)
      this.rootStore.pianoRollStore.notesCursor = cursor
    }
  }

  onMouseUp(e: PianoNotesMouseEvent) {
    if (this.action) {
      this.actionMouseUp(e)
    }
    this.action = null
  }
}

const dragScrollAction = (pianoRollStore: PianoRollStore): MouseGesture => (
  onMouseDown
) => {
  onMouseDown(() => {
    observeDrag({
      onMouseMove: (e: MouseEvent) => {
        pianoRollStore.scrollBy(e.movementX, e.movementY)
      },
    })
  })
}

const changeToolAction = (pianoRollStore: PianoRollStore): MouseGesture => (
  onMouseDown
) => {
  onMouseDown(() => {
    pianoRollStore.toggleTool()
    pianoRollStore.notesCursor = "crosshair"
  })
}
