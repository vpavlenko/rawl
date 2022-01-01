import { IPoint, pointAdd } from "../../../../common/geometry"
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
import { PianoNoteItem } from "../../../stores/PianoRollStore"
import RootStore from "../../../stores/RootStore"
import { MouseGesture } from "./NoteMouseHandler"

export const getPencilActionForMouseDown =
  (rootStore: RootStore) =>
  (e: MouseEvent): MouseGesture | null => {
    const local = rootStore.pianoRollStore.getLocal(e)
    const items = rootStore.pianoRollStore.getNotes(local)

    switch (e.button) {
      case 0: {
        if (items.length > 0) {
          if (e.detail % 2 === 0) {
            return removeNoteAction
          }

          const item = items[0]
          previewNoteById(rootStore)(item.id)

          if (e.shiftKey) {
            if (item.isSelected) {
              removeNoteFromSelection(rootStore)(item.id)
            } else {
              addNoteToSelection(rootStore)(item.id)
            }
          } else {
            if (!item.isSelected) {
              selectNote(rootStore)(item.id)
            }
            const position = getPositionType(local, item)
            switch (position) {
              case "center":
                return dragNoteCenterAction(item)
              case "left":
                return dragNoteLeftAction(item)
              case "right":
                return dragNoteRightAction(item)
            }
          }
        } else {
          if (e.shiftKey || e.ctrlKey) {
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

export const getPencilCursorForMouseMove =
  (rootStore: RootStore) =>
  (e: MouseEvent): string => {
    const local = rootStore.pianoRollStore.getLocal(e)
    const items = rootStore.pianoRollStore.getNotes(local)
    if (items.length > 0) {
      const position = getPositionType(local, items[0])
      return mousePositionToCursor(position)
    }

    return "auto"
  }

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

const getPositionType = (
  local: IPoint,
  item: PianoNoteItem
): MousePositionType => {
  if (item === null) {
    console.warn("no item")
    return "center"
  }
  const localX = local.x - item.x

  if (item.isDrum) {
    return "center"
  }
  const edgeSize = Math.min(item.width / 3, 8)
  if (localX <= edgeSize) {
    return "left"
  }
  if (item.width - localX <= edgeSize) {
    return "right"
  }
  return "center"
}

const dragNoteCenterAction =
  (item: PianoNoteItem): MouseGesture =>
  (rootStore) =>
  (e) => {
    const { transform, quantizer } = rootStore.pianoRollStore

    observeDrag2(e, {
      onMouseMove: (e, delta) => {
        const position = pointAdd(item, delta)
        moveNote(rootStore)({
          id: item.id,
          tick: quantizer.round(transform.getTicks(position.x)),
          noteNumber: Math.round(transform.getNoteNumberFractional(position.y)),
        })
        e.stopPropagation()
      },
      onClick: (e) => {
        if (!e.shiftKey) {
          selectNote(rootStore)(item.id)
        }
      },
    })
  }

const dragNoteLeftAction =
  (item: PianoNoteItem): MouseGesture =>
  (rootStore) =>
  (e) => {
    const local = rootStore.pianoRollStore.getLocal(e)
    const {
      pianoRollStore: { transform },
    } = rootStore
    const startTick = transform.getTicks(local.x)

    observeDrag2(e, {
      onMouseMove: (e, delta) => {
        const tick = startTick + transform.getTicks(delta.x)
        resizeNoteLeft(rootStore)(item.id, tick)
        e.stopPropagation()
      },
      onClick: (e) => {
        if (!e.shiftKey) {
          selectNote(rootStore)(item.id)
        }
      },
    })
  }

const dragNoteRightAction =
  (item: PianoNoteItem): MouseGesture =>
  (rootStore) =>
  (e) => {
    const local = rootStore.pianoRollStore.getLocal(e)
    const {
      pianoRollStore: { transform },
    } = rootStore
    const startTick = transform.getTicks(local.x)

    observeDrag2(e, {
      onMouseMove: (e, delta) => {
        const tick = startTick + transform.getTicks(delta.x)
        resizeNoteRight(rootStore)(item.id, tick)
        e.stopPropagation()
      },
      onClick: (e) => {
        if (!e.shiftKey) {
          selectNote(rootStore)(item.id)
        }
      },
    })
  }

const createNoteAction: MouseGesture = (rootStore) => (e) => {
  const { transform, quantizer } = rootStore.pianoRollStore
  const local = rootStore.pianoRollStore.getLocal(e)

  if (e.shiftKey) {
    return
  }

  resetSelection(rootStore)()

  const { tick, noteNumber } = transform.getNotePoint(local)
  const note = createNote(rootStore)(tick, noteNumber)

  if (note === undefined) {
    return
  }

  selectNote(rootStore)(note.id)

  observeDrag2(e, {
    onMouseMove: (_e, delta) => {
      const tick = note.tick + transform.getTicks(delta.x)
      const noteNumber = note.noteNumber + transform.getDeltaNoteNumber(delta.y)
      moveNote(rootStore)({
        id: note.id,
        tick: quantizer.round(tick),
        noteNumber: Math.round(noteNumber),
      })
    },
  })
}

const removeNoteAction: MouseGesture = (rootStore) => (e) => {
  const startPos = rootStore.pianoRollStore.getLocal(e)
  const items = rootStore.pianoRollStore.getNotes(startPos)
  if (items.length > 0) {
    removeEvent(rootStore)(items[0].id)
  }

  observeDrag2(e, {
    onMouseMove: (_e, delta) => {
      const local = pointAdd(startPos, delta)
      const items = rootStore.pianoRollStore.getNotes(local)
      if (items.length > 0) {
        removeEvent(rootStore)(items[0].id)
      }
    },
  })
}

const selectNoteAction: MouseGesture = (rootStore) => (e) => {
  const {
    pianoRollStore: { transform },
  } = rootStore

  const local = rootStore.pianoRollStore.getLocal(e)
  const start = transform.getNotePoint(local)
  const startPos = local
  startSelection(rootStore)(start, true)

  observeDrag2(e, {
    onMouseMove: (_e, delta) => {
      const offsetPos = pointAdd(startPos, delta)
      const end = transform.getNotePoint(offsetPos)
      resizeSelection(rootStore)(start, end)
    },

    onMouseUp: () => {
      fixSelection(rootStore)(true)
    },
  })
}
