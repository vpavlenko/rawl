import NoteMouseHandler from "./NoteMouseHandler"
import { pointSub, pointAdd } from "../helpers/point"
import pencilImage from "../images/iconmonstr-pencil-14-16.png"

export default class PencilMouseHandler extends NoteMouseHandler {
  actionForMouseDown(e) {
    const original = super.actionForMouseDown(e)
    if (original) {
      return original
    }

    const { dispatch } = this

    if (e.nativeEvent.button !== 0) {
      return null
    }

    if (e.item) {
      if (e.nativeEvent.detail === 2) {
        return removeNoteAction(dispatch)
      } else {
        switch(e.position) {
          case "center": return moveNoteAction(dispatch)
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
    noteId = dispatch("CREATE_NOTE", { position: e.local })
  })

  onMouseMove(e => {
    const position = {
      x: e.local.x,
      y: e.local.y
    }
    dispatch("MOVE_NOTE", { id: noteId, position })
  })
}

const removeNoteAction = dispatch => (onMouseDown) => {
  onMouseDown(e => dispatch("REMOVE_NOTE", { id: e.item.id }))
}

const moveNoteAction = dispatch => (onMouseDown, onMouseMove) => {
  let startPosition
  let notePosition
  let noteId

  onMouseDown(e => {
    startPosition = e.local
    noteId = e.item.id
    notePosition = {
      x: e.item.x,
      y: e.item.y
    }
  })

  onMouseMove(e => {
    const position = pointAdd(notePosition, pointSub(e.local, startPosition))
    dispatch("MOVE_NOTE_CENTER", { id: noteId, position })
  })
}

const dragLeftNoteAction = dispatch => (onMouseDown, onMouseMove) => {
  let noteId

  onMouseDown(e => {
    noteId = e.item.id
  })

  onMouseMove(e => {
    dispatch("RESIZE_NOTE_LEFT", { id: noteId, position: e.local })
  })
}

const dragRightNoteAction = dispatch => (onMouseDown, onMouseMove) => {
  let noteId

  onMouseDown(e => {
    noteId = e.item.id
  })

  onMouseMove(e => {
    dispatch("RESIZE_NOTE_RIGHT", { id: noteId, position: e.local })
  })
}

// helpers

function cursorForPositionType(type) {
  switch(type) {
    case "left":
    case "right":
      return "w-resize"
    default: return "move"
  }
}
