import { pointAdd } from "../../../../common/geometry"
import {
  addNoteToSelection,
  createNote,
  moveNote,
  previewNoteById,
  removeEvent,
  removeNoteFromSelection,
  resetSelection,
  resizeNoteLeft,
  resizeNoteRight,
  selectNote,
} from "../../../actions"
import { observeDrag2 } from "../../../helpers/observeDrag"
import { PianoNotesMouseEvent } from "../PianoRollStage"
import NoteMouseHandler, { MouseGesture } from "./NoteMouseHandler"

type MousePositionType = "left" | "center" | "right"

const mousePositionToCursor = (position: MousePositionType) => {
  switch (position) {
    case "center":
      return "move"
    case "left":
      return "w-resize"
    case "right":
      return "e-resize"
  }
}

const getPositionType = (e: PianoNotesMouseEvent): MousePositionType => {
  if (e.item === null) {
    console.warn("no item")
    return "center"
  }
  const localX = e.local.x - e.item.x

  if (e.item.isDrum) {
    return "center"
  }
  const edgeSize = Math.min(e.item.width / 3, 8)
  if (localX <= edgeSize) {
    return "left"
  }
  if (e.item.width - localX <= edgeSize) {
    return "right"
  }
  return "center"
}

export default class PencilMouseHandler extends NoteMouseHandler {
  protected actionForMouseDown(e: PianoNotesMouseEvent): MouseGesture | null {
    const original = super.actionForMouseDown(e)
    if (original) {
      return original
    }

    switch (e.nativeEvent.button) {
      case 0: {
        if (e.item !== null) {
          const { item } = e
          previewNoteById(this.rootStore)(item.id)

          if (e.nativeEvent.shiftKey) {
            if (item.isSelected) {
              removeNoteFromSelection(this.rootStore)(item.id)
            } else {
              addNoteToSelection(this.rootStore)(item.id)
            }
          } else if (!item.isSelected) {
            selectNote(this.rootStore)(item.id)
          }

          if (!e.nativeEvent.shiftKey) {
            return dragNoteAction
          }
        }

        return createNoteAction
      }
      case 2:
        return removeNoteAction
      default:
        return null
    }
  }

  protected getCursorForMouseMove(e: PianoNotesMouseEvent): string {
    if (e.item !== null) {
      const position = getPositionType(e)
      return mousePositionToCursor(position)
    }

    return "auto"
  }
}

const dragNoteAction: MouseGesture = (rootStore) => ({
  onMouseDown: (e) => {
    if (!(e.nativeEvent instanceof MouseEvent)) {
      return
    }
    if (e.item === null) {
      return
    }
    const {
      pianoRollStore: { transform },
    } = rootStore
    const { item } = e
    const position = getPositionType(e)
    const startTick = e.tick

    observeDrag2(e.nativeEvent, {
      onMouseMove: (e, delta) => {
        const tick = startTick + transform.getTicks(delta.x)

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
        if (!e.nativeEvent.shiftKey) {
          selectNote(rootStore)(item.id)
        }
      },
    })
  },
})

const createNoteAction: MouseGesture = (rootStore) => ({
  onMouseDown: (e) => {
    if (e.nativeEvent.shiftKey) {
      return
    }

    if ((rootStore.pianoRollStore.selection?.noteIds ?? []).length > 1) {
      resetSelection(rootStore)()
      return
    }

    const noteId = createNote(rootStore)(e.tick, e.noteNumber)

    if (noteId === undefined) {
      return
    }

    selectNote(rootStore)(noteId)

    const startPos = e.local

    observeDrag2(e.nativeEvent, {
      onMouseMove: (e, delta) => {
        const { transform } = rootStore.pianoRollStore
        const local = pointAdd(startPos, delta)
        const p = transform.getNotePoint(local)
        moveNote(rootStore)({
          id: noteId,
          tick: p.tick,
          noteNumber: Math.floor(p.noteNumber),
          quantize: "floor",
        })
      },
    })
  },
})

const removeNoteAction: MouseGesture = (rootStore) => ({
  onMouseDown: (e) => {
    if (e.item !== null) {
      removeEvent(rootStore)(e.item.id)
    }
  },

  onMouseMove: (e) => {
    if (e.item !== null) {
      removeEvent(rootStore)(e.item.id)
    }
  },
})
