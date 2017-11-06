import NoteMouseHandler from "./NoteMouseHandler"
import { pointSub, pointAdd } from "helpers/point"
import pencilImage from "images/iconmonstr-pencil-14-16.png"

export default class PencilMouseHandler extends NoteMouseHandler {
  actionForMouseDown(e) {
    const original = super.actionForMouseDown(e)
    if (original) {
      return original
    }

    const { dispatch, transform } = this

    if (e.nativeEvent.button !== 0) {
      return null
    }

    if (e.item) {
      if (e.nativeEvent.detail === 2) {
        return removeNoteAction(dispatch)
      } else {
        switch (e.position) {
          case "center": return moveNoteAction(dispatch, transform, e.nativeEvent.ctrlKey)
          case "left": return dragLeftNoteAction(dispatch)
          case "right": return dragRightNoteAction(dispatch)
          default: throw Error()
        }
      }
    } else {
      return createNoteAction(dispatch)
    }
  }

  getCursor(e) {
    if (e.item) {
      return cursorForPositionType(e.position)
    }

    return `url(${pencilImage}) 0 16, default`
  }
}

export const createNoteAction = dispatch => (onMouseDown, onMouseMove) => {
  let noteId

  onMouseDown(e => {
    noteId = dispatch("CREATE_NOTE", e)
  })

  onMouseMove(e => {
    dispatch("MOVE_NOTE", {
      id: noteId,
      tick: e.tick,
      noteNumber: e.noteNumber,
      quantize: "floor"
    })
  })
}

const removeNoteAction = dispatch => (onMouseDown) => {
  onMouseDown(e => dispatch("REMOVE_EVENT", { eventId: e.item.id }))
}

const moveNoteAction = (dispatch, transform, isCopy) => (onMouseDown, onMouseMove) => {
  let startPosition
  let notePosition
  let noteId

  onMouseDown(e => {
    startPosition = e.local
    notePosition = e.item.bounds
    if (isCopy) {
      noteId = dispatch("CREATE_NOTE", e)
    } else {
      noteId = e.item.id
    }
  })

  onMouseMove(e => {
    const position = pointAdd(notePosition, pointSub(e.local, startPosition))
    dispatch("MOVE_NOTE", {
      id: noteId,
      tick: transform.getTicks(position.x),
      noteNumber: Math.round(transform.getNoteNumber(position.y)),
      quantize: "round"
    })
  })
}

const dragLeftNoteAction = dispatch => (onMouseDown, onMouseMove) => {
  let noteId

  onMouseDown(e => {
    noteId = e.item.id
  })

  onMouseMove(e => {
    dispatch("RESIZE_NOTE_LEFT", { id: noteId, tick: e.tick })
  })
}

const dragRightNoteAction = dispatch => (onMouseDown, onMouseMove) => {
  let noteId

  onMouseDown(e => {
    noteId = e.item.id
  })

  onMouseMove(e => {
    dispatch("RESIZE_NOTE_RIGHT", { id: noteId, tick: e.tick })
  })
}

// helpers

function cursorForPositionType(type) {
  switch (type) {
    case "left":
    case "right":
      return "w-resize"
    default: return "move"
  }
}
