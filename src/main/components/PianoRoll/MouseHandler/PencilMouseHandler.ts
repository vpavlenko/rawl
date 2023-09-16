import { IPoint, pointAdd } from "../../../../common/geometry"
import { isNoteEvent, NoteEvent } from "../../../../common/track"
import {
  addNoteToSelection,
  createNote,
  fixSelection,
  moveSelectionBy,
  removeEvent,
  removeNoteFromSelection,
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
  item: PianoNoteItem,
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
    const {
      pianoRollStore: { selectedTrack },
    } = rootStore

    if (selectedTrack === undefined) {
      return
    }

    const note = selectedTrack.getEventById(item.id)
    if (note == undefined || !isNoteEvent(note)) {
      return
    }

    startDragNote(rootStore)(e, note)
  }

const dragNoteEdgeAction =
  (edge: "left" | "right") =>
  (item: PianoNoteItem): MouseGesture =>
  (rootStore) =>
  (e) => {
    const {
      player,
      pianoRollStore: { selectedTrack, transform, isQuantizeEnabled },
    } = rootStore

    if (selectedTrack === undefined || selectedTrack.channel === undefined) {
      return
    }

    const note = selectedTrack.getEventById(item.id)
    if (note == undefined || !isNoteEvent(note)) {
      return
    }

    const { channel } = selectedTrack
    player.startNote({ ...note, channel })

    const local = rootStore.pianoRollStore.getLocal(e)
    const startTick = transform.getTicks(local.x)

    observeDrag2(e, {
      onMouseMove: (e, delta) => {
        const tick = startTick + transform.getTicks(delta.x)
        const quantize = !e.shiftKey && isQuantizeEnabled

        switch (edge) {
          case "left":
            resizeNoteLeft(rootStore)(item.id, tick, quantize)
            break
          case "right":
            resizeNoteRight(rootStore)(item.id, tick, quantize)
            break
        }
        e.stopPropagation()
      },
      onMouseUp: () => {
        player.stopNote({ ...note, channel })
      },
      onClick: (e) => {
        if (!e.shiftKey) {
          selectNote(rootStore)(item.id)
        }
      },
    })
  }

const dragNoteLeftAction = dragNoteEdgeAction("left")

const dragNoteRightAction = dragNoteEdgeAction("right")

const startDragNote =
  (rootStore: RootStore) => (e: MouseEvent, note: NoteEvent) => {
    const {
      player,
      pianoRollStore: { selectedTrack },
    } = rootStore
    const { transform, quantizer } = rootStore.pianoRollStore
    const channel = selectedTrack?.channel ?? 0

    player.startNote({ ...note, channel })

    let prevNoteNumber = note.noteNumber
    let prevTick = note.tick

    observeDrag2(e, {
      onMouseMove: (_e, delta) => {
        const tick = quantizer.round(note.tick + transform.getTicks(delta.x))
        const noteNumber = Math.round(
          note.noteNumber + transform.getDeltaNoteNumber(delta.y),
        )

        const tickChanged = tick !== prevTick
        const pitchChanged = noteNumber !== prevNoteNumber

        if (pitchChanged || tickChanged) {
          moveSelectionBy(rootStore)({
            tick: tick - prevTick,
            noteNumber: noteNumber - prevNoteNumber,
          })
        }

        if (pitchChanged) {
          player.stopNote({ noteNumber: prevNoteNumber, channel })
          player.startNote({ noteNumber, channel, velocity: note.velocity })
        }

        prevTick = tick
        prevNoteNumber = noteNumber
      },
      onMouseUp: (_e) => {
        player.stopNote({ noteNumber: prevNoteNumber, channel })
      },
      onClick: () => {
        if (!e.shiftKey) {
          selectNote(rootStore)(note.id)
        }
      },
    })
  }

const createNoteAction: MouseGesture = (rootStore) => (e) => {
  const { transform } = rootStore.pianoRollStore
  const local = rootStore.pianoRollStore.getLocal(e)

  if (e.shiftKey) {
    return
  }

  const { tick, noteNumber } = transform.getNotePoint(local)
  const note = createNote(rootStore)(tick, noteNumber)

  if (note === undefined) {
    return
  }

  selectNote(rootStore)(note.id)
  startDragNote(rootStore)(e, note)
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
