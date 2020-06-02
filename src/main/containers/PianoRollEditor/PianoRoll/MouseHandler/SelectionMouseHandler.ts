import MouseHandler, { MouseGesture } from "./NoteMouseHandler"
import { pointSub, pointAdd, IPoint } from "common/geometry"
import { NoteCoordTransform } from "common/transform"
import SelectionModel from "common/selection/SelectionModel"
import {
  openContextMenuAction,
  resizeSelection,
  fixSelection,
  startSelection,
  cloneSelection,
  moveSelection,
  resizeSelectionRight,
  resizeSelectionLeft,
} from "main/actions"
import { NotePoint } from "common/transform/NotePoint"
import { Dispatcher } from "createDispatcher"
import { PianoNotesMouseEvent } from "components/PianoRoll/PianoNotes/PianoNotes"

export default class SelectionMouseHandler extends MouseHandler {
  selection: SelectionModel

  protected actionForMouseDown(e: PianoNotesMouseEvent) {
    const original = super.actionForMouseDown(e)
    if (original) {
      return original
    }

    if (e.nativeEvent.relatedTarget) {
      return null
    }

    const type = positionType(this.selection, e.transform, e.local)
    const { dispatch, selection } = this

    if (e.nativeEvent.button === 0) {
      switch (type) {
        case "center":
          return moveSelectionAction(dispatch, selection, e.nativeEvent.ctrlKey)
        case "right":
          return dragSelectionRightEdgeAction(dispatch)
        case "left":
          return dragSelectionLeftEdgeAction(dispatch)
        case "outside":
          break
        default:
          break
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
        default:
          selected = false
          break
      }
      return contextMenuAction(selected, dispatch)
    }

    return null
  }

  getCursorForMouseMove(e: PianoNotesMouseEvent) {
    const type = positionType(this.selection, e.transform, e.local)
    switch (type) {
      case "center":
        return "move"
      case "left":
        return "w-resize"
      case "right":
        return "w-resize"
      default:
        return "crosshair"
    }
  }
}

function positionType(
  selection: SelectionModel,
  transform: NoteCoordTransform,
  pos: IPoint
) {
  const rect = selection.getBounds(transform)
  const contains =
    rect.x <= pos.x &&
    rect.x + rect.width >= pos.x &&
    rect.y <= pos.y &&
    rect.y + rect.height >= pos.y
  if (!contains) {
    return "outside"
  }
  const localX = pos.x - rect.x
  const edgeSize = Math.min(rect.width / 3, 8)
  if (localX <= edgeSize) {
    return "left"
  }
  if (rect.width - localX <= edgeSize) {
    return "right"
  }
  return "center"
}

const contextMenuAction = (
  isNoteSelected: boolean,
  dispatch: Dispatcher
): MouseGesture => (onMouseDown, onMouseMove, onMouseUp) => {
  onMouseUp((e) => {
    dispatch(openContextMenuAction(e.nativeEvent, isNoteSelected))
  })
}

// 選択範囲外でクリックした場合は選択範囲をリセット
const createSelectionAction = (dispatch: Dispatcher): MouseGesture => (
  onMouseDown,
  onMouseMove,
  onMouseUp
) => {
  let start: NotePoint

  onMouseDown((e) => {
    start = { tick: e.tick, noteNumber: e.noteNumber }
    dispatch(startSelection(start))
  })

  onMouseMove((e) => {
    const end = { tick: e.tick, noteNumber: e.noteNumber }
    dispatch(resizeSelection(start, end))
  })

  onMouseUp(() => {
    dispatch(fixSelection())
  })
}

const moveSelectionAction = (
  dispatch: Dispatcher,
  selection: SelectionModel,
  isCopy: boolean
): MouseGesture => (onMouseDown, onMouseMove) => {
  let startPos: IPoint
  let selectionPos: IPoint

  onMouseDown((e) => {
    startPos = e.local
    selectionPos = selection.getBounds(e.transform)
    if (isCopy) {
      dispatch(cloneSelection())
    }
  })

  onMouseMove((e) => {
    const position = pointAdd(selectionPos, pointSub(e.local, startPos))
    const tick = e.transform.getTicks(position.x)
    const noteNumber = Math.round(e.transform.getNoteNumber(position.y))
    dispatch(moveSelection({ tick, noteNumber }))
  })
}

const dragSelectionLeftEdgeAction = (dispatch: Dispatcher): MouseGesture => (
  onMouseDown,
  onMouseMove
) => {
  onMouseDown(() => {})

  onMouseMove((e) => {
    const tick = e.transform.getTicks(e.local.x)
    dispatch(resizeSelectionLeft(tick))
  })
}

const dragSelectionRightEdgeAction = (dispatch: Dispatcher): MouseGesture => (
  onMouseDown,
  onMouseMove
) => {
  onMouseDown(() => {})

  onMouseMove((e) => {
    const tick = e.transform.getTicks(e.local.x)
    dispatch(resizeSelectionRight(tick))
  })
}
