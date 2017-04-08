export default class NoteMouseHandler {
  constructor(changeCursor, toggleTool) {
    this.changeCursor = changeCursor
    this.toggleTool = toggleTool

    this.onMouseDown = this.onMouseDown.bind(this)
    this.onMouseMove = this.onMouseMove.bind(this)
    this.onMouseUp = this.onMouseUp.bind(this)
  }

  // mousedown 以降に行う MouseAction を返す
  actionForMouseDown(e) {
    // 共通の action

    if (e.nativeEvent.button == 1) {
      // wheel drag to start scrolling
      return dragScrollAction(() => {
        // TODO: PianoRoll をスクロールする
      })
    }

    // 右ダブルクリック
    if (e.nativeEvent.button == 2 && e.nativeEvent.detail % 2 == 0) {
      return changeToolAction(this.toggleTool)
    }

    // サブクラスで残りを実装
    return null
  }

  getCursor() {
    // サブクラスで実装
    return "auto"
  }

  onMouseDown(e) {
    this.action = this.actionForMouseDown(e)
    if (!this.action) {
      return
    }
    let actionMouseDown = () => {}
    this.actionMouseMove = () => {}
    this.actionMouseUp = () => {}
    const registerMouseDown = f => {
      actionMouseDown = f
    }
    const registerMouseMove = f => {
      this.actionMouseMove = f
    }
    const registerMouseUp = f => {
      this.actionMouseUp = f
    }
    this.action(
      registerMouseDown,
      registerMouseMove,
      registerMouseUp)
    actionMouseDown(e)
  }

  onMouseMove(e) {
    if (this.action) {
      this.actionMouseMove(e)
    } else {
      this.changeCursor(this.getCursor(e))
    }
  }

  onMouseUp(e) {
    if (this.action) {
      this.actionMouseUp(e)
    }
    this.action = null
    this.changeCursor(this.getCursor(e))
    e.nativeEvent.preventDefault()
  }
}

const dragScrollAction = (scrollBy) => (onMouseDown, onMouseMove) => {
  onMouseMove((e) => scrollBy(e.nativeEvent.movementX, e.nativeEvent.movementY))
}

const changeToolAction = (toggleTool) => onMouseDown => {
  onMouseDown(() => toggleTool())
}
