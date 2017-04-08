import MouseHandler from "./NoteMouseHandler"
import { pointSub, pointAdd } from "../helpers/point"

export default class SelectionMouseHandler extends MouseHandler {
  actionForMouseDown(e) {
    const original = super.actionForMouseDown(e)
    if (original) {
      return original
    }

    if (e.nativeEvent.button !== 0) {
      return null
    }

    const c = this.selectionController
    if (!c) {
      throw new Error("this.selectionController をセットすること")
    }

    if (e.relatedTarget) {
      return null
    }

    const type = c.positionType(e.local)
    switch (type) {
      case "center": return moveSelectionAction(
        p => c.moveTo(p),
        () => c.getRect())
      case "right": return dragSelectionRightEdgeAction(p => c.resizeRight(p))
      case "left": return dragSelectionLeftEdgeAction(p => c.resizeLeft(p))
      case "outside": break
    }

    return createSelectionAction(
      p => c.startAt(p),
      p => c.resize(p),
      () => c.selectNotes())
  }

  getCursor(e) {
    const c = this.selectionController
    if (!c) {
      throw new Error("this.selectionController をセットすること")
    }

    const type = c.positionType(e.local)
    switch(type) {
      case "center" : return "move"
      case "left": return "w-resize"
      case "right": return "w-resize"
      default: return "crosshair"
    }
  }
}

// 選択範囲外でクリックした場合は選択範囲をリセット
const createSelectionAction = (startAt, resize, selectNotes) => (onMouseDown, onMouseMove, onMouseUp) => {
  onMouseDown(e => startAt(e.local))
  onMouseMove(e => resize(e.local))
  onMouseUp(() => selectNotes())
}

const moveSelectionAction = (moveTo, getRect) => (onMouseDown, onMouseMove) => {
  let startPos
  let selectionPos

  onMouseDown(e => {
    startPos = e.local
    selectionPos = getRect()
  })

  onMouseMove(e => {
    const pos = pointAdd(selectionPos, pointSub(e.local, startPos))
    moveTo(pos)
  })
}

const dragSelectionLeftEdgeAction = resizeLeft => (onMouseDown, onMouseMove) => {
  onMouseDown(() => {})

  onMouseMove(e => {
    resizeLeft(e.local)
  })
}

const dragSelectionRightEdgeAction = resizeRight => (onMouseDown, onMouseMove) => {
  onMouseDown(() => {})

  onMouseMove(e => {
    resizeRight(e.local)
  })
}
