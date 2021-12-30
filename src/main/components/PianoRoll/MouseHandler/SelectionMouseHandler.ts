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
import MouseHandler, { MouseGesture } from "./NoteMouseHandler"

export default class SelectionMouseHandler extends MouseHandler {
  protected actionForMouseDown(e: MouseEvent) {
    const original = super.actionForMouseDown(e)
    if (original) {
      return original
    }

    if (e.relatedTarget) {
      return null
    }

    const { selection, transform } = this.rootStore.pianoRollStore
    const local = this.rootStore.pianoRollStore.getLocal(e)

    if (e.button === 0) {
      if (selection !== null) {
        const type = positionType(selection, transform, local)
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

  getCursorForMouseMove(e: MouseEvent) {
    const { selection, transform } = this.rootStore.pianoRollStore
    const local = this.rootStore.pianoRollStore.getLocal(e)
    const type =
      selection === null ? "outside" : positionType(selection, transform, local)
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
const createSelectionAction: MouseGesture = (rootStore) => (e) => {
  const {
    pianoRollStore: { transform },
  } = rootStore

  const local = rootStore.pianoRollStore.getLocal(e)
  const start = transform.getNotePoint(local)
  const startPos = local
  startSelection(rootStore)(start)

  observeDrag2(e, {
    onMouseMove: (_e, delta) => {
      const offsetPos = pointAdd(startPos, delta)
      const end = transform.getNotePoint(offsetPos)
      resizeSelection(rootStore)(start, end)
    },

    onMouseUp: () => {
      fixSelection(rootStore)()
    },
  })
}

const moveSelectionAction: MouseGesture = (rootStore) => (e) => {
  const {
    pianoRollStore: { selection, transform },
  } = rootStore
  if (selection === null) {
    return
  }

  const local = rootStore.pianoRollStore.getLocal(e)
  const isCopy = e.ctrlKey
  const startPos = local
  const selectionPos = getSelectionBounds(selection, transform)

  if (isCopy) {
    cloneSelection(rootStore)()
  }

  observeDrag2(e, {
    onMouseMove: (_e, delta) => {
      const { transform } = rootStore.pianoRollStore
      const local = pointAdd(startPos, delta)
      const position = pointAdd(selectionPos, pointSub(local, startPos))
      const tick = transform.getTicks(position.x)
      const noteNumber = Math.round(transform.getNoteNumber(position.y))
      moveSelection(rootStore)({ tick, noteNumber })
    },
  })
}

const dragSelectionLeftEdgeAction: MouseGesture = (rootStore) => (e) => {
  const startPos = rootStore.pianoRollStore.getLocal(e)

  observeDrag2(e, {
    onMouseMove: (_e, delta) => {
      const local = pointAdd(startPos, delta)
      const tick = rootStore.pianoRollStore.transform.getTicks(local.x)
      resizeSelectionLeft(rootStore)(tick)
    },
  })
}

const dragSelectionRightEdgeAction: MouseGesture = (rootStore) => (e) => {
  const startPos = rootStore.pianoRollStore.getLocal(e)

  observeDrag2(e, {
    onMouseMove: (_e, delta) => {
      const local = pointAdd(startPos, delta)
      const tick = rootStore.pianoRollStore.transform.getTicks(local.x)
      resizeSelectionRight(rootStore)(tick)
    },
  })
}
