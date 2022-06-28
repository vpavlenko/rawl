import { observeDrag } from "../../../helpers/observeDrag"
import RootStore from "../../../stores/RootStore"
import {
  getPencilActionForMouseDown,
  getPencilCursorForMouseMove,
} from "./PencilMouseHandler"
import {
  getSelectionActionForMouseDown,
  getSelectionCursorForMouseMoven,
} from "./SelectionMouseHandler"

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
  actionForMouseDown(e: MouseEvent): MouseGesture | null {
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

    switch (this.rootStore.pianoRollStore.mouseMode) {
      case "pencil":
        return getPencilActionForMouseDown(this.rootStore)(e)
      case "selection":
        return getSelectionActionForMouseDown(this.rootStore)(e)
    }
  }

  protected getCursorForMouseMove(e: MouseEvent): string {
    switch (this.rootStore.pianoRollStore.mouseMode) {
      case "pencil":
        return getPencilCursorForMouseMove(this.rootStore)(e)
      case "selection":
        return getSelectionCursorForMouseMoven(this.rootStore)(e)
    }
  }

  onMouseDown(ev: React.MouseEvent) {
    const e = ev.nativeEvent
    this.isMouseDown = true
    this.actionForMouseDown(e)?.(this.rootStore)(e)
  }

  onMouseMove(ev: React.MouseEvent) {
    const e = ev.nativeEvent
    if (!this.isMouseDown) {
      const cursor = this.getCursorForMouseMove(e)
      this.rootStore.pianoRollStore.notesCursor = cursor
    }
  }

  onMouseUp(_ev: React.MouseEvent) {
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
