import NoteMouseHandler from "./NoteMouseHandler"
import { pointSub, pointAdd } from "../helpers/point"
import pencilImage from "../images/iconmonstr-pencil-14-16.png"

export default class PencilMouseHandler extends NoteMouseHandler {
  actionForMouseDown(e) {
    const original = super.actionForMouseDown(e)
    if (original) {
      return original
    }

    const n = this.noteController
    if (!n) {
      throw new Error("this.noteController をセットすること")
    }

    if (e.nativeEvent.button !== 0) {
      return null
    }

    if (e.item) {
      if (e.nativeEvent.detail == 2) {
        return removeNoteAction(id => n.remove(id))
      } else {
        switch(e.position) {
          case "center": return moveNoteAction((id, d) => n.moveCenter(id, d))
          case "left": return dragLeftNoteAction((id, d) => n.resizeLeft(id, d))
          case "right": return dragRightNoteAction((id, d) => n.resizeRight(id, d))
        }
      }
    } else {
      return createNoteAction(
        l => n.createAt(l),
        (id, d) => n.moveTo(id, d))
    }
  }

  getCursor(e) {
    if (e.item) {
      return cursorForPositionType(e.position)
    }

    return `url(${pencilImage}) 0 16, default`
  }
}

export const createNoteAction = (createNote, moveNote) => (onMouseDown, onMouseMove) => {
  let noteId

  onMouseDown(e => {
    noteId = createNote(e.local)
  })

  onMouseMove(e => {
    moveNote(noteId, {
      x: e.local.x,
      y: e.local.y
    })
  })
}

const removeNoteAction = removeNote => (onMouseDown) => {
  onMouseDown(e => { removeNote(e.item.id) })
}

const moveNoteAction = moveNoteCenter => (onMouseDown, onMouseMove) => {
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
    const pos = pointAdd(notePosition, pointSub(e.local, startPosition))
    moveNoteCenter(noteId, pos)
  })
}

const dragLeftNoteAction = resizeLeft => (onMouseDown, onMouseMove) => {
  let noteId

  onMouseDown(e => {
    noteId = e.item.id
  })

  onMouseMove(e => {
    resizeLeft(noteId, e.local)
  })
}

const dragRightNoteAction = resizeRight => (onMouseDown, onMouseMove) => {
  let noteId

  onMouseDown(e => {
    noteId = e.item.id
  })

  onMouseMove(e => {
    resizeRight(noteId, e.local)
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
