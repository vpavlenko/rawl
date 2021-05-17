import PianoRollStore from "../../../stores/PianoRollStore"
import RootStore from "../../../stores/RootStore"
import { PianoNotesMouseEvent } from "../PianoRollStage"
import { observeDrag } from "./observeDrag"

export interface MouseGesture {
  onMouseDown: (e: PianoNotesMouseEvent) => void
  onMouseMove?: (e: PianoNotesMouseEvent) => void
  onMouseUp?: (e: PianoNotesMouseEvent) => void
}

export default class NoteMouseHandler {
  protected readonly rootStore: RootStore
  private action: MouseGesture | null = null

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore
    this.onMouseDown = this.onMouseDown.bind(this)
    this.onMouseMove = this.onMouseMove.bind(this)
    this.onMouseUp = this.onMouseUp.bind(this)
  }

  // mousedown 以降に行う MouseAction を返す
  // Returns a MouseAction to do after MouseDown
  protected actionForMouseDown(e: PianoNotesMouseEvent): MouseGesture | null {
    // 共通の action
    // Common Action

    // wheel drag to start scrolling
    if (e.nativeEvent.button === 1) {
      return dragScrollAction(this.rootStore.pianoRollStore)
    }

    // 右ダブルクリック
    // Right Double-click
    if (e.nativeEvent.button === 2 && e.nativeEvent.detail % 2 === 0) {
      return changeToolAction(this.rootStore.pianoRollStore)
    }

    // サブクラスで残りを実装
    // Implement the rest with subclasses
    return null
  }

  protected getCursorForMouseMove(ev: PianoNotesMouseEvent): string {
    // サブクラスで実装
    // Implemented in subclasses
    return "auto"
  }

  onMouseDown(e: PianoNotesMouseEvent) {
    this.action = this.actionForMouseDown(e)
    this.action?.onMouseDown(e)
  }

  onMouseMove(e: PianoNotesMouseEvent) {
    if (this.action) {
      this.action?.onMouseMove?.(e)
    } else {
      const cursor = this.getCursorForMouseMove(e)
      this.rootStore.pianoRollStore.notesCursor = cursor
    }
  }

  onMouseUp(e: PianoNotesMouseEvent) {
    this.action?.onMouseUp?.(e)
    this.action = null
  }
}

const dragScrollAction = (pianoRollStore: PianoRollStore): MouseGesture => ({
  onMouseDown: () => {
    observeDrag({
      onMouseMove: (e: MouseEvent) => {
        pianoRollStore.scrollBy(e.movementX, e.movementY)
      },
    })
  },
})

const changeToolAction = (pianoRollStore: PianoRollStore): MouseGesture => ({
  onMouseDown: () => {
    pianoRollStore.toggleTool()
    pianoRollStore.notesCursor = "crosshair"
  },
})
