import { IPoint, pointAdd, pointSub } from "../../../../common/geometry"
import {
  getSelectionBounds,
  Selection,
} from "../../../../common/selection/Selection"
import { NoteCoordTransform } from "../../../../common/transform"
import {
  cloneSelection,
  fixSelection,
  moveSelection,
  resizeSelection,
  resizeSelectionLeft,
  resizeSelectionRight,
  startSelection,
} from "../../../actions"
import { observeDrag2 } from "../../../helpers/observeDrag"
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

    const { selection, transform } = this.rootStore.pianoRollStore

    if (e.nativeEvent.button === 0) {
      if (selection !== null) {
        const type = positionType(selection, transform, e.local)
        switch (type) {
          case "center":
            return moveSelectionAction
          case "right":
            return dragSelectionRightEdgeAction
          case "left":
            return dragSelectionLeftEdgeAction
          case "outside":
            return createSelectionAction
        }
      } else {
        return createSelectionAction
      }
    }

    return null
  }

  getCursorForMouseMove(e: PianoNotesMouseEvent) {
    const { selection, transform } = this.rootStore.pianoRollStore
    const type =
      selection === null
        ? "outside"
        : positionType(selection, transform, e.local)
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
const createSelectionAction: MouseGesture = (rootStore) => ({
  onMouseDown: (e) => {
    const {
      pianoRollStore: { transform },
    } = rootStore

    const start = transform.getNotePoint(e.local)
    const startPos = e.local
    startSelection(rootStore)(start)

    observeDrag2(e.nativeEvent, {
      onMouseMove: (_e, delta) => {
        const offsetPos = pointAdd(startPos, delta)
        const end = transform.getNotePoint(offsetPos)
        resizeSelection(rootStore)(start, end)
      },

      onMouseUp: () => {
        fixSelection(rootStore)()
      },
    })
  },
})

const moveSelectionAction: MouseGesture = (rootStore) => ({
  onMouseDown: (e) => {
    const {
      pianoRollStore: { selection, transform },
    } = rootStore
    if (selection === null) {
      return
    }

    const isCopy = e.nativeEvent.ctrlKey
    const startPos = e.local
    const selectionPos = getSelectionBounds(selection, transform)

    if (isCopy) {
      cloneSelection(rootStore)()
    }

    observeDrag2(e.nativeEvent, {
      onMouseMove: (_e, delta) => {
        const { transform } = rootStore.pianoRollStore
        const local = pointAdd(startPos, delta)
        const position = pointAdd(selectionPos, pointSub(local, startPos))
        const tick = transform.getTicks(position.x)
        const noteNumber = Math.round(transform.getNoteNumber(position.y))
        moveSelection(rootStore)({ tick, noteNumber })
      },
    })
  },
})

const dragSelectionLeftEdgeAction: MouseGesture = (rootStore) => ({
  onMouseDown: (e) => {
    const startPos = e.local

    observeDrag2(e.nativeEvent, {
      onMouseMove: (_e, delta) => {
        const local = pointAdd(startPos, delta)
        const tick = rootStore.pianoRollStore.transform.getTicks(local.x)
        resizeSelectionLeft(rootStore)(tick)
      },
    })
  },
})

const dragSelectionRightEdgeAction: MouseGesture = (rootStore) => ({
  onMouseDown: (e) => {
    const startPos = e.local

    observeDrag2(e.nativeEvent, {
      onMouseMove: (_e, delta) => {
        const local = pointAdd(startPos, delta)
        const tick = rootStore.pianoRollStore.transform.getTicks(local.x)
        resizeSelectionRight(rootStore)(tick)
      },
    })
  },
})
