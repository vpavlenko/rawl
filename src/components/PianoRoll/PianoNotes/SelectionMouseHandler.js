import MouseHandler from "./NoteMouseHandler"
import { pointSub, pointAdd } from "../../../helpers/point"

export default class SelectionMouseHandler extends MouseHandler {
  actionForMouseDown(e) {
    const original = super.actionForMouseDown(e)
    if (original) {
      return original
    }

    const { dispatch } = this

    if (e.relatedTarget) {
      return null
    }

    const type = this.getPositionType(e.local)

    if (e.nativeEvent.button === 0) {
      switch (type) {
        case "center": return moveSelectionAction(dispatch)
        case "right": return dragSelectionRightEdgeAction(dispatch)
        case "left": return dragSelectionLeftEdgeAction(dispatch)
        case "outside": break
        default: break
      }

      return createSelectionAction(dispatch)
    }

    // 右クリックした場合はコンテキストメニューを表示
    if (e.nativeEvent.button === 2) {
      let selected
      switch (type) {
        case "center":
        case "right":
        case "left":
          selected = true
          break
        case "outside":
          selected = false
          break
        default: break
      }
      return contextMenuAction(selected, dispatch)
    }

    return null
  }

  getPositionType = position =>
    this.dispatch("GET_SELECTION_POSITION_TYPE", { position })

  getCursor(e) {
    const type = this.getPositionType(e.local)
    switch (type) {
      case "center": return "move"
      case "left": return "w-resize"
      case "right": return "w-resize"
      default: return "crosshair"
    }
  }
}

const contextMenuAction = (isNoteSelected, dispatch) => (onMouseDown, onMouseMove, onMouseUp) => {
  onMouseUp(e => {
    e = e.nativeEvent
    e.preventDefault()
    dispatch("OPEN_CONTEXT_MENU", {
      position: { x: e.pageX, y: e.pageY },
      isNoteSelected
    })
  })
}

// 選択範囲外でクリックした場合は選択範囲をリセット
const createSelectionAction = dispatch => (onMouseDown, onMouseMove, onMouseUp) => {
  let start

  onMouseDown(e => {
    start = { tick: e.tick, noteNumber: e.noteNumber }
    dispatch("START_SELECTION", start)
  })

  onMouseMove(e => {
    const end = { tick: e.tick, noteNumber: e.noteNumber }
    dispatch("RESIZE_SELECTION", { start, end })
  })

  onMouseUp(() => {
    dispatch("FIX_SELECTION")
  })
}

const moveSelectionAction = dispatch => (onMouseDown, onMouseMove) => {
  let startPos
  let selectionPos

  onMouseDown(e => {
    startPos = e.local
    selectionPos = dispatch("GET_SELECTION_RECT")
  })

  onMouseMove(e => {
    const position = pointAdd(selectionPos, pointSub(e.local, startPos))
    dispatch("MOVE_SELECTION_XY", { position })
  })
}

const dragSelectionLeftEdgeAction = dispatch => (onMouseDown, onMouseMove) => {
  onMouseDown(() => { })

  onMouseMove(e => {
    dispatch("RESIZE_SELECTION_LEFT_XY", { position: e.local })
  })
}

const dragSelectionRightEdgeAction = dispatch => (onMouseDown, onMouseMove) => {
  onMouseDown(() => { })

  onMouseMove(e => {
    dispatch("RESIZE_SELECTION_RIGHT_XY", { position: e.local })
  })
}
