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
import { PianoNotesMouseEvent } from "../PianoRollStage"
import NoteMouseHandler, { MouseGesture } from "./NoteMouseHandler"
import { observeDrag } from "./observeDrag"

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

    if (e.nativeEvent.button !== 0) {
      return null
    }
    if (e.item !== null) {
      const { item } = e
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

  protected getCursorForMouseMove(e: PianoNotesMouseEvent): string {
    if (e.item !== null) {
      const position = getPositionType(e)
      return mousePositionToCursor(position)
    }

    return "auto"
  }
}

const dragNoteAction = (rootStore: RootStore): MouseGesture => ({
  onMouseDown: (e) => {
    if (!(e.nativeEvent instanceof MouseEvent)) {
      return
    }
    if (e.item === null) {
      return
    }
    const { transform } = e
    const { item } = e
    const startOffsetPos = {
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
    }
    const position = getPositionType(e)
    const startTick = e.tick

    observeDrag({
      onMouseMove: (e) => {
        const offsetPos = { x: e.offsetX, y: e.offsetY }
        const delta = pointSub(offsetPos, startOffsetPos)
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
