import NoteMouseHandler, { MouseGesture } from "./NoteMouseHandler"
import { pointSub, pointAdd, IPoint } from "common/geometry"
import pencilImage from "images/iconmonstr-pencil-14-16.png"
import { NoteCoordTransform } from "common/transform"
import {
  createNote,
  moveNote,
  removeEvent,
  resizeNoteLeft,
  resizeNoteRight,
} from "main/actions"
import { Dispatcher2 } from "createDispatcher"
import { PianoNotesMouseEvent } from "components/PianoRoll/PianoNotes/PianoNotes"

export default class PencilMouseHandler extends NoteMouseHandler {
  transform: NoteCoordTransform

  protected actionForMouseDown(
    e: PianoNotesMouseEvent<MouseEvent>
  ): MouseGesture | null {
    const original = super.actionForMouseDown(e)
    if (original) {
      return original
    }

    const { dispatch2: dispatch, transform } = this

    if (e.nativeEvent.button !== 0) {
      return null
    }

    if (e.item) {
      if (e.nativeEvent.detail === 2) {
        return removeNoteAction(dispatch)
      } else {
        switch (getPositionType(e)) {
          case "center":
            return moveNoteAction(dispatch, transform, e.nativeEvent.ctrlKey)
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

  getCursorForMouseMove(e: PianoNotesMouseEvent<MouseEvent>) {
    if (e.item) {
      return cursorForPositionType(getPositionType(e))
    }
    return `url(${pencilImage}) 0 16, default`
  }
}

export const createNoteAction = (dispatch: Dispatcher2): MouseGesture => (
  onMouseDown,
  onMouseMove
) => {
  let noteId: number

  onMouseDown((e) => {
    noteId = dispatch(createNote(e.tick, e.noteNumber))
  })

  onMouseMove((e) => {
    dispatch(
      moveNote({
        id: noteId,
        tick: e.tick,
        noteNumber: e.noteNumber,
        quantize: "floor",
      })
    )
  })
}

const removeNoteAction = (dispatch: Dispatcher2): MouseGesture => (
  onMouseDown
) => {
  onMouseDown((e) => dispatch(removeEvent(e.item.id)))
}

const moveNoteAction = (
  dispatch: Dispatcher2,
  transform: NoteCoordTransform,
  isCopy: boolean
): MouseGesture => (onMouseDown, onMouseMove) => {
  let startPosition: IPoint
  let notePosition: IPoint
  let noteId: number

  onMouseDown((e) => {
    startPosition = e.local
    notePosition = e.item.bounds
    if (isCopy) {
      noteId = dispatch(createNote(e.tick, e.noteNumber))
    } else {
      noteId = e.item.id
    }
  })

  onMouseMove((e) => {
    const position = pointAdd(notePosition, pointSub(e.local, startPosition))
    dispatch(
      moveNote({
        id: noteId,
        tick: transform.getTicks(position.x),
        noteNumber: Math.round(transform.getNoteNumber(position.y)),
        quantize: "round",
      })
    )
  })
}

const dragLeftNoteAction = (dispatch: Dispatcher2): MouseGesture => (
  onMouseDown,
  onMouseMove
) => {
  let noteId: number

  onMouseDown((e) => {
    noteId = e.item.id
  })

  onMouseMove((e) => {
    dispatch(resizeNoteLeft(noteId, e.tick))
  })
}

const dragRightNoteAction = (dispatch: Dispatcher2): MouseGesture => (
  onMouseDown,
  onMouseMove
) => {
  let noteId: number

  onMouseDown((e) => {
    noteId = e.item.id
  })

  onMouseMove((e) => {
    dispatch(resizeNoteRight(noteId, e.tick))
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

function getPositionType({ local, item }: PianoNotesMouseEvent<MouseEvent>) {
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
