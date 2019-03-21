import { Dispatcher } from "main/createDispatcher"
import { CHANGE_CURSOR, SCROLL_BY, TOGGLE_TOOL } from "main/actions"
import { ItemEvent } from "src/main/components/Stage/Stage"

export type MouseAction = (e: any) => void
type MouseGesture = (
  onMouseDown: MouseAction,
  onMouseMove?: MouseAction,
  onMouseUp?: MouseAction
) => void

export default class NoteMouseHandler {
  dispatch: Dispatcher
  private action: MouseGesture
  private actionMouseMove: MouseAction
  private actionMouseUp: MouseAction

  constructor() {
    this.onMouseDown = this.onMouseDown.bind(this)
    this.onMouseMove = this.onMouseMove.bind(this)
    this.onMouseUp = this.onMouseUp.bind(this)
  }

  // mousedown 以降に行う MouseAction を返す
  protected actionForMouseDown(e: any): MouseGesture {
    // 共通の action

    if (e.button === 1) {
      // wheel drag to start scrolling
      return dragScrollAction(this.dispatch)
    }

    // 右ダブルクリック
    if (e.button === 2 && e.detail % 2 === 0) {
      return changeToolAction(this.dispatch)
    }

    // サブクラスで残りを実装
    return null
  }

  protected getCursorForMouseMove(_: ItemEvent): string {
    // サブクラスで実装
    return "auto"
  }

  onMouseDown(e: any) {
    this.action = this.actionForMouseDown(e)
    if (!this.action) {
      return
    }
    let actionMouseDown: MouseAction = () => {}
    this.actionMouseMove = () => {}
    this.actionMouseUp = () => {}
    const registerMouseDown = (f: MouseAction) => {
      actionMouseDown = f
    }
    const registerMouseMove = (f: MouseAction) => {
      this.actionMouseMove = f
    }
    const registerMouseUp = (f: MouseAction) => {
      this.actionMouseUp = f
    }
    this.action(registerMouseDown, registerMouseMove, registerMouseUp)
    actionMouseDown(e)
  }

  onMouseMove(e: MouseEvent & ItemEvent) {
    if (this.action) {
      this.actionMouseMove(e)
    } else {
      const cursor = this.getCursorForMouseMove(e)
      this.dispatch(CHANGE_CURSOR, cursor)
    }
  }

  onMouseUp(e: MouseEvent) {
    if (this.action) {
      this.actionMouseUp(e)
    }
    this.action = null
  }
}

const dragScrollAction = (dispatch: Dispatcher) => () => {
  const onGlobalMouseMove = (e: MouseEvent) => {
    dispatch(SCROLL_BY, { x: e.movementX, y: e.movementY })
  }

  const onGlobalMouseUp = () => {
    document.removeEventListener("mousemove", onGlobalMouseMove)
    document.removeEventListener("mouseup", onGlobalMouseUp)
  }

  document.addEventListener("mousemove", onGlobalMouseMove)
  document.addEventListener("mouseup", onGlobalMouseUp)
}

const changeToolAction = (dispatch: Dispatcher) => (
  onMouseDown: MouseAction
) => {
  onMouseDown(() => {
    dispatch(TOGGLE_TOOL)
    dispatch(CHANGE_CURSOR, "crosshair")
  })
}
