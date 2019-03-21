import NoteMouseHandler, { MouseAction } from "./NoteMouseHandler"
import { pointSub, pointAdd, IPoint } from "common/geometry"
import pencilImage from "images/iconmonstr-pencil-14-16.png"
import { NoteCoordTransform } from "common/transform"
import {
  CREATE_NOTE,
  MOVE_NOTE,
  REMOVE_EVENT,
  RESIZE_NOTE_LEFT,
  RESIZE_NOTE_RIGHT
} from "main/actions"
import { Dispatcher } from "src/main/createDispatcher"

export default class PencilMouseHandler extends NoteMouseHandler {
  transform: NoteCoordTransform

  protected actionForMouseDown(e: any) {
    const original = super.actionForMouseDown(e)
    if (original) {
      return original
    }

    const { dispatch, transform } = this

    if (e.button !== 0) {
      return null
    }

    if (e.item) {
      if (e.detail === 2) {
        return removeNoteAction(dispatch)
      } else {
        switch (getPositionType(e)) {
          case "center":
            return moveNoteAction(dispatch, transform, e.ctrlKey)
          case "left":
            return dragLeftNoteAction(dispatch)
          case "right":
            return dragRightNoteAction(dispatch)
          default:
            throw Error()
        }
      }
    } else {
      return createNoteAction(dispatch)
    }
  }

  getCursorForMouseMove(e: any) {
    if (e.item) {
      return cursorForPositionType(getPositionType(e))
    }
    return `url(${pencilImage}) 0 16, default`
  }
}

export const createNoteAction = (dispatch: Dispatcher) => (
  onMouseDown: MouseAction,
  onMouseMove: MouseAction
) => {
  let noteId: number

  onMouseDown((e: any) => {
    noteId = dispatch(CREATE_NOTE, e)
  })

  onMouseMove((e: any) => {
    dispatch(MOVE_NOTE, {
      id: noteId,
      tick: e.tick,
      noteNumber: e.noteNumber,
      quantize: "floor"
    })
  })
}

const removeNoteAction = (dispatch: Dispatcher) => (
  onMouseDown: MouseAction
) => {
  onMouseDown((e: any) => dispatch(REMOVE_EVENT, { eventId: e.item.id }))
}

const moveNoteAction = (
  dispatch: Dispatcher,
  transform: NoteCoordTransform,
  isCopy: boolean
) => (onMouseDown: MouseAction, onMouseMove: MouseAction) => {
  let startPosition: IPoint
  let notePosition: IPoint
  let noteId: number

  onMouseDown((e: any) => {
    startPosition = e.local
    notePosition = e.item.bounds
    if (isCopy) {
      noteId = dispatch(CREATE_NOTE, e)
    } else {
      noteId = e.item.id
    }
  })

  onMouseMove((e: any) => {
    const position = pointAdd(notePosition, pointSub(e.local, startPosition))
    dispatch(MOVE_NOTE, {
      id: noteId,
      tick: transform.getTicks(position.x),
      noteNumber: Math.round(transform.getNoteNumber(position.y)),
      quantize: "round"
    })
  })
}

const dragLeftNoteAction = (dispatch: Dispatcher) => (
  onMouseDown: MouseAction,
  onMouseMove: MouseAction
) => {
  let noteId: number

  onMouseDown((e: any) => {
    noteId = e.item.id
  })

  onMouseMove((e: any) => {
    dispatch(RESIZE_NOTE_LEFT, { id: noteId, tick: e.tick })
  })
}

const dragRightNoteAction = (dispatch: Dispatcher) => (
  onMouseDown: MouseAction,
  onMouseMove: MouseAction
) => {
  let noteId: number

  onMouseDown((e: any) => {
    noteId = e.item.id
  })

  onMouseMove((e: any) => {
    dispatch(RESIZE_NOTE_RIGHT, { id: noteId, tick: e.tick })
  })
}

// helpers

function cursorForPositionType(type: string) {
  switch (type) {
    case "left":
    case "right":
      return "w-resize"
    default:
      return "move"
  }
}

function getPositionType({ local, item }: any) {
  if (item.isDrum) {
    return "center"
  }
  const localX = local.x - item.bounds.x
  const edgeSize = Math.min(item.bounds.width / 3, 8)
  if (localX <= edgeSize) {
    return "left"
  }
  if (item.bounds.width - localX <= edgeSize) {
    return "right"
  }
  return "center"
}
