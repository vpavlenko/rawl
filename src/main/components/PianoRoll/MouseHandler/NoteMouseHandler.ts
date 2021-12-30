import { observeDrag } from "../../../helpers/observeDrag"
import RootStore from "../../../stores/RootStore"

export type MouseGesture = (rootStore: RootStore) => (e: MouseEvent) => void

export default class NoteMouseHandler {
  protected readonly rootStore: RootStore
  private isMouseDown = false

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore
    this.onMouseDown = this.onMouseDown.bind(this)
    this.onMouseMove = this.onMouseMove.bind(this)
    this.onMouseUp = this.onMouseUp.bind(this)
  }

  // mousedown 以降に行う MouseAction を返す
  // Returns a MouseAction to do after MouseDown
  protected actionForMouseDown(e: MouseEvent): MouseGesture | null {
    // 共通の action
    // Common Action

    // wheel drag to start scrolling
    if (e.button === 1) {
      return dragScrollAction
    }

    // 右ダブルクリック
    // Right Double-click
    if (e.button === 2 && e.detail % 2 === 0) {
      return changeToolAction
    }

    // サブクラスで残りを実装
    // Implement the rest with subclasses
    return null
  }

  protected getCursorForMouseMove(ev: MouseEvent): string {
    // サブクラスで実装
    // Implemented in subclasses
    return "auto"
  }

  onMouseDown(e: MouseEvent) {
    this.isMouseDown = true
    this.actionForMouseDown(e)?.(this.rootStore)(e)
  }

  onMouseMove(e: MouseEvent) {
    if (!this.isMouseDown) {
      const cursor = this.getCursorForMouseMove(e)
      this.rootStore.pianoRollStore.notesCursor = cursor
    }
  }

  onMouseUp() {
    this.isMouseDown = false
  }
}

const dragScrollAction: MouseGesture =
  ({ pianoRollStore }) =>
  () => {
    observeDrag({
      onMouseMove: (e: MouseEvent) => {
        pianoRollStore.scrollBy(e.movementX, e.movementY)
      },
    })
  }

const changeToolAction: MouseGesture =
  ({ pianoRollStore }) =>
  () => {
    pianoRollStore.toggleTool()
    pianoRollStore.notesCursor = "crosshair"
  }
