import MouseHandler, { MouseGesture } from "./NoteMouseHandler"
import { pointSub, pointAdd, IPoint } from "common/geometry"
import { NoteCoordTransform } from "common/transform"
import SelectionModel from "common/selection/SelectionModel"
import {
  OPEN_CONTEXT_MENU,
  START_SELECTION,
  RESIZE_SELECTION,
  FIX_SELECTION,
  CLONE_SELECTION,
  MOVE_SELECTION,
  RESIZE_SELECTION_LEFT,
  RESIZE_SELECTION_RIGHT
} from "main/actions"
import { NotePoint } from "common/transform/NotePoint"
import { Dispatcher } from "createDispatcher"
import { PianoNotesMouseEvent } from "components/PianoRoll/PianoNotes/PianoNotes"

export default class SelectionMouseHandler extends MouseHandler {
  transform: NoteCoordTransform
  selection: SelectionModel

  protected actionForMouseDown(e: PianoNotesMouseEvent<MouseEvent>) {
    const original = super.actionForMouseDown(e)
    if (original) {
      return original
    }

    if (e.nativeEvent.relatedTarget) {
      return null
    }

    const type = this.getPositionType(e.local)
    const { dispatch, selection, transform } = this

    if (e.nativeEvent.button === 0) {
      switch (type) {
        case "center":
          return moveSelectionAction(
            dispatch,
            selection,
            transform,
            e.nativeEvent.ctrlKey
          )
        case "right":
          return dragSelectionRightEdgeAction(dispatch, transform)
        case "left":
          return dragSelectionLeftEdgeAction(dispatch, transform)
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
          break
      }
      return contextMenuAction(selected, dispatch)
    }

    return null
  }

  getPositionType(position: IPoint) {
    return positionType(this.selection, this.transform, position)
  }

  getCursorForMouseMove(e: PianoNotesMouseEvent<MouseEvent>) {
    const type = this.getPositionType(e.local)
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
  onMouseUp(e => {
    dispatch(OPEN_CONTEXT_MENU, e.nativeEvent, isNoteSelected)
  })
}

// 選択範囲外でクリックした場合は選択範囲をリセット
const createSelectionAction = (dispatch: Dispatcher): MouseGesture => (
  onMouseDown,
  onMouseMove,
  onMouseUp
) => {
  let start: NotePoint

  onMouseDown(e => {
    start = { tick: e.tick, noteNumber: e.noteNumber }
    dispatch(START_SELECTION, start)
  })

  onMouseMove(e => {
    const end = { tick: e.tick, noteNumber: e.noteNumber }
    dispatch(RESIZE_SELECTION, start, end)
  })

  onMouseUp(() => {
    dispatch(FIX_SELECTION)
  })
}

const moveSelectionAction = (
  dispatch: Dispatcher,
  selection: SelectionModel,
  transform: NoteCoordTransform,
  isCopy: boolean
): MouseGesture => (onMouseDown, onMouseMove) => {
  let startPos: IPoint
  let selectionPos: IPoint

  onMouseDown(e => {
    startPos = e.local
    selectionPos = selection.getBounds(transform)
    if (isCopy) {
      dispatch(CLONE_SELECTION)
    }
  })

  onMouseMove(e => {
    const position = pointAdd(selectionPos, pointSub(e.local, startPos))
    const tick = transform.getTicks(position.x)
    const noteNumber = Math.round(transform.getNoteNumber(position.y))
    dispatch(MOVE_SELECTION, { tick, noteNumber })
  })
}

const dragSelectionLeftEdgeAction = (
  dispatch: Dispatcher,
  transform: NoteCoordTransform
): MouseGesture => (onMouseDown, onMouseMove) => {
  onMouseDown(() => {})

  onMouseMove(e => {
    const tick = transform.getTicks(e.local.x)
    dispatch(RESIZE_SELECTION_LEFT, tick)
  })
}

const dragSelectionRightEdgeAction = (
  dispatch: Dispatcher,
  transform: NoteCoordTransform
): MouseGesture => (onMouseDown, onMouseMove) => {
  onMouseDown(() => {})

  onMouseMove(e => {
    const tick = transform.getTicks(e.local.x)
    dispatch(RESIZE_SELECTION_RIGHT, tick)
  })
}
