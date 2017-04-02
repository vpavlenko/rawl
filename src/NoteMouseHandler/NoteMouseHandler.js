export default class NoteMouseHandler {
  // mousedown 以降に行う MouseAction を返す
  actionForMouseDown(e) {
    // 共通の action

    if (e.nativeEvent.button == 1) {
      // wheel drag to start scrolling
      return dragScrollAction(() => {
          console.warn("TODO: PianoRoll をスクロールする")
      })
    }

    if (e.nativeEvent.button == 2 && e.nativeEvent.detail == 2) {
      return changeToolAction(() => {
        console.warn("TODO: ツールをトグルする")
      })
    }

    // サブクラスで残りを実装
    return null
  }

  changeCursor(cursor) {
    // TODO: implement
  }

  getCursor(e) {
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
      let cursor = this.getCursor(e)
      this.changeCursor(cursor)
    }
  }

  onMouseUp(e) {
    if (this.action) {
      this.actionMouseUp(e)
    }
    this.action = null
  }
}

const dragScrollAction = (scrollBy) => (onMouseDown, onMouseMove) => {
  onMouseMove((e) => scrollBy(e.nativeEvent.movementX, e.nativeEvent.movementY))
}

const changeToolAction = (toggleTool) => onMouseDown => {
  onMouseDown(() => toggleTool())
}
