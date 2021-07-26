import { IPoint, pointAdd, pointSub } from "../../../../common/geometry"
import {
  getSelectionBounds,
  Selection,
} from "../../../../common/selection/Selection"
import { NoteCoordTransform } from "../../../../common/transform"
import { NotePoint } from "../../../../common/transform/NotePoint"
import {
  cloneSelection,
  fixSelection,
  moveSelection,
  resizeSelection,
  resizeSelectionLeft,
  resizeSelectionRight,
  startSelection,
} from "../../../actions"
import { getClientPos } from "../../../helpers/mouseEvent"
import { observeDrag } from "../../../helpers/observeDrag"
import RootStore from "../../../stores/RootStore"
import { PianoNotesMouseEvent } from "../PianoRollStage"
import MouseHandler, { MouseGesture } from "./NoteMouseHandler"

export default class SelectionMouseHandler extends MouseHandler {
  protected actionForMouseDown(e: PianoNotesMouseEvent) {
    const original = super.actionForMouseDown(e)
    if (original) {
      return original
    }

    if (e.nativeEvent.relatedTarget) {
      return null
    }

    const { selection } = this.rootStore.pianoRollStore

    if (e.nativeEvent.button === 0) {
      if (selection !== null) {
        const type = positionType(selection, e.transform, e.local)
        switch (type) {
          case "center":
            return moveSelectionAction(
              this.rootStore,
              selection,
              e.nativeEvent.ctrlKey
            )
          case "right":
            return dragSelectionRightEdgeAction(this.rootStore)
          case "left":
            return dragSelectionLeftEdgeAction(this.rootStore)
          case "outside":
            return createSelectionAction(this.rootStore)
        }
      } else {
        return createSelectionAction(this.rootStore)
      }
    }

    return null
  }

  getCursorForMouseMove(e: PianoNotesMouseEvent) {
    const { selection } = this.rootStore.pianoRollStore
    const type =
      selection === null
        ? "outside"
        : positionType(selection, e.transform, e.local)
    switch (type) {
      case "center":
        return "move"
      case "left":
        return "w-resize"
      case "right":
        return "e-resize"
      case "outside":
        return "crosshair"
    }
  }
}

function positionType(
  selection: Selection,
  transform: NoteCoordTransform,
  pos: IPoint
) {
  const rect = getSelectionBounds(selection, transform)
  const contains =
    rect.x <= pos.x &&
    rect.x + rect.width >= pos.x &&
    rect.y <= pos.y &&
    rect.y + rect.height >= pos.y
  if (!contains) {
    return "outside"
  }
  const localX = pos.x - rect.x
  const edgeSize = Math.min(rect.width / 3, 8)
  if (localX <= edgeSize) {
    return "left"
  }
  if (rect.width - localX <= edgeSize) {
    return "right"
  }
  return "center"
}

// 選択範囲外でクリックした場合は選択範囲をリセット
const createSelectionAction = (rootStore: RootStore): MouseGesture => {
  let start: NotePoint
  let startPos: IPoint
  let startClientPos: IPoint

  return {
    onMouseDown: (e) => {
      start = { tick: e.tick, noteNumber: e.noteNumber }
      startPos = e.local
      startClientPos = getClientPos(e.nativeEvent)
      startSelection(rootStore)(e)

      observeDrag({
        onMouseMove: (e) => {
          const pos = getClientPos(e)
          const delta = pointSub(pos, startClientPos)
          const offsetPos = pointAdd(startPos, delta)
          const end = rootStore.pianoRollStore.transform.getNotePoint(offsetPos)
          resizeSelection(rootStore)(start, end)
        },

        onMouseUp: () => {
          fixSelection(rootStore)()
        },
      })
    },
  }
}

const moveSelectionAction = (
  rootStore: RootStore,
  selection: Selection,
  isCopy: boolean
): MouseGesture => {
  let startPos: IPoint
  let selectionPos: IPoint

  return {
    onMouseDown: (e) => {
      startPos = e.local
      selectionPos = getSelectionBounds(selection, e.transform)
      if (isCopy) {
        cloneSelection(rootStore)()
      }
    },

    onMouseMove: (e) => {
      const position = pointAdd(selectionPos, pointSub(e.local, startPos))
      const tick = e.transform.getTicks(position.x)
      const noteNumber = Math.round(e.transform.getNoteNumber(position.y))
      moveSelection(rootStore)({ tick, noteNumber })
    },
  }
}

const dragSelectionLeftEdgeAction = (rootStore: RootStore): MouseGesture => ({
  onMouseDown: () => {},

  onMouseMove: (e) => {
    resizeSelectionLeft(rootStore)(e.tick)
  },
})

const dragSelectionRightEdgeAction = (rootStore: RootStore): MouseGesture => ({
  onMouseDown: () => {},

  onMouseMove: (e) => {
    resizeSelectionRight(rootStore)(e.tick)
  },
})
