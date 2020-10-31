import { pointAdd, pointSub } from "../../../../common/geometry"
import {
  addNoteToSelection,
  createNote,
  moveNote,
  previewNoteById,
  removeNoteToSelection,
  resetSelection,
  resizeNoteLeft,
  resizeNoteRight,
  selectNote,
} from "../../../actions"
import RootStore from "../../../stores/RootStore"
import {
  getPositionType,
  isPianoNote,
  mousePositionToCursor,
} from "../PianoNotes/PianoNote"
import { PianoNotesMouseEvent } from "../PianoRollStage"
import NoteMouseHandler, { MouseGesture } from "./NoteMouseHandler"
import { observeDrag } from "./observeDrag"

export default class PencilMouseHandler extends NoteMouseHandler {
  protected actionForMouseDown(e: PianoNotesMouseEvent): MouseGesture | null {
    const original = super.actionForMouseDown(e)
    if (original) {
      return original
    }

    if (e.nativeEvent.button !== 0) {
      return null
    }

    if (isPianoNote(e.pixiEvent.target)) {
      const { item } = e.pixiEvent.target
      previewNoteById(this.rootStore)(item.id)

      if (e.nativeEvent.shiftKey) {
        if (item.isSelected) {
          removeNoteToSelection(this.rootStore)(item.id)
        } else {
          addNoteToSelection(this.rootStore)(item.id)
        }
      } else if (!item.isSelected) {
        selectNote(this.rootStore)(item.id)
      }

      if (!e.nativeEvent.shiftKey) {
        return dragNoteAction(this.rootStore)
      }
    }

    return createNoteAction(this.rootStore)
  }

  protected getCursorForMouseMove(ev: PianoNotesMouseEvent): string {
    const e = ev.pixiEvent

    if (isPianoNote(e.target) && e.target.parent !== null) {
      const offsetPos = {
        x: ev.nativeEvent.offsetX,
        y: ev.nativeEvent.offsetY,
      }
      const local = e.target.toLocal(offsetPos)
      const { item } = e.target
      const position = getPositionType(local.x, item.width)
      return mousePositionToCursor(position)
    }

    return "auto"
  }
}

const dragNoteAction = (rootStore: RootStore): MouseGesture => ({
  onMouseDown: (ev) => {
    const e = ev.pixiEvent
    if (!(e.data.originalEvent instanceof MouseEvent)) {
      return
    }
    if (!isPianoNote(e.target)) {
      return
    }
    const { transform } = ev
    const { item } = e.target
    const offset = e.data.getLocalPosition(e.target.parent)
    const startOffsetPos = {
      x: e.data.originalEvent.offsetX,
      y: e.data.originalEvent.offsetY,
    }
    const local = e.target.toLocal(startOffsetPos)
    const position = getPositionType(local.x, item.width)

    observeDrag({
      onMouseMove: (e) => {
        const offsetPos = { x: e.offsetX, y: e.offsetY }
        const delta = pointSub(offsetPos, startOffsetPos)
        const newOffset = pointAdd(delta, offset)
        const tick = transform.getTicks(newOffset.x)

        switch (position) {
          case "center": {
            const position = pointAdd(item, delta)
            moveNote(rootStore)({
              id: item.id,
              tick: transform.getTicks(position.x),
              noteNumber: Math.round(transform.getNoteNumber(position.y)),
              quantize: "round",
            })
            break
          }
          case "left":
            resizeNoteLeft(rootStore)(item.id, tick)
            break
          case "right":
            resizeNoteRight(rootStore)(item.id, tick)
            break
        }
        e.stopPropagation()
      },
      onClick: () => {
        if (!ev.nativeEvent.shiftKey) {
          selectNote(rootStore)(item.id)
        }
      },
    })
  },
})

const createNoteAction = (rootStore: RootStore): MouseGesture => {
  let noteId: number | undefined

  return {
    onMouseDown: (e) => {
      if (e.nativeEvent.shiftKey) {
        return
      }

      if (rootStore.pianoRollStore.selection.noteIds.length > 1) {
        resetSelection(rootStore)()
        return
      }

      noteId = createNote(rootStore)(e.tick, e.noteNumber)
      if (noteId !== undefined) {
        selectNote(rootStore)(noteId)
      }
    },

    onMouseMove: (e) => {
      if (noteId === undefined) {
        return
      }
      moveNote(rootStore)({
        id: noteId,
        tick: e.tick,
        noteNumber: e.noteNumber,
        quantize: "floor",
      })
    },
  }
}
