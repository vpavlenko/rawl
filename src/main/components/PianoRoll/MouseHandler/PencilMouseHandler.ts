import { pointAdd } from "../../../../common/geometry"
import {
  addNoteToSelection,
  createNote,
  fixSelection,
  moveNote,
  previewNoteById,
  removeEvent,
  removeNoteFromSelection,
  resetSelection,
  resizeNoteLeft,
  resizeNoteRight,
  resizeSelection,
  selectNote,
  startSelection,
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
          if (e.nativeEvent.detail % 2 === 0) {
            return removeNoteAction
          }

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
        } else {
          if (e.nativeEvent.shiftKey || e.nativeEvent.ctrlKey) {
            return selectNoteAction
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
    const startTick = transform.getTicks(e.local.x)

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
    const { transform } = rootStore.pianoRollStore

    if (e.nativeEvent.shiftKey) {
      return
    }

    resetSelection(rootStore)()

    const { tick, noteNumber } = transform.getNotePoint(e.local)
    const noteId = createNote(rootStore)(tick, noteNumber)

    if (noteId === undefined) {
      return
    }

    selectNote(rootStore)(noteId)

    const startPos = e.local

    observeDrag2(e.nativeEvent, {
      onMouseMove: (e, delta) => {
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
  onMouseDown: (e, getNotes) => {
    if (e.item !== null) {
      removeEvent(rootStore)(e.item.id)
    }

    const startPos = e.local

    observeDrag2(e.nativeEvent, {
      onMouseMove: (e, delta) => {
        const local = pointAdd(startPos, delta)
        const items = getNotes(local)
        if (items.length > 0) {
          removeEvent(rootStore)(items[0].id)
        }
      },
    })
  },
})

const selectNoteAction: MouseGesture = (rootStore) => ({
  onMouseDown: (e) => {
    const {
      pianoRollStore: { transform },
    } = rootStore

    const start = transform.getNotePoint(e.local)
    const startPos = e.local
    startSelection(rootStore)(start, true)

    observeDrag2(e.nativeEvent, {
      onMouseMove: (_e, delta) => {
        const offsetPos = pointAdd(startPos, delta)
        const end = transform.getNotePoint(offsetPos)
        resizeSelection(rootStore)(start, end)
      },

      onMouseUp: () => {
        fixSelection(rootStore)(true)
      },
    })
  },
})
