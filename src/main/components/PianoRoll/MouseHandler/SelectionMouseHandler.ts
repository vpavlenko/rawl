import { IPoint, IRect, pointAdd, pointSub } from "../../../../common/geometry"
import {
  getSelectionBounds,
  Selection,
} from "../../../../common/selection/Selection"
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
import RootStore from "../../../stores/RootStore"
import { MouseGesture } from "./NoteMouseHandler"

export const getSelectionActionForMouseDown =
  (rootStore: RootStore) =>
  (e: MouseEvent): MouseGesture | null => {
    if (e.relatedTarget) {
      return null
    }

    const { selection, selectionBounds } = rootStore.pianoRollStore
    const local = rootStore.pianoRollStore.getLocal(e)

    if (e.button === 0) {
      if (selection !== null && selectionBounds !== null) {
        const type = positionType(selectionBounds, local)
        switch (type) {
          case "center":
            return moveSelectionAction(selection)
          case "right":
            return dragSelectionRightEdgeAction(selection)
          case "left":
            return dragSelectionLeftEdgeAction(selection)
          case "outside":
            return createSelectionAction
        }
      } else {
        return createSelectionAction
      }
    }

    return null
  }

export const getSelectionCursorForMouseMoven =
  (rootStore: RootStore) => (e: MouseEvent) => {
    const { selectionBounds } = rootStore.pianoRollStore
    const local = rootStore.pianoRollStore.getLocal(e)
    const type =
      selectionBounds === null
        ? "outside"
        : positionType(selectionBounds, local)
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

function positionType(selectionBounds: IRect, pos: IPoint) {
  const rect = selectionBounds
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

const moveSelectionAction =
  (selection: Selection): MouseGesture =>
  (rootStore) =>
  (e) => {
    const {
      pianoRollStore: { transform },
    } = rootStore

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

const dragSelectionLeftEdgeAction =
  (_selection: Selection): MouseGesture =>
  (rootStore) =>
  (e) => {
    const startPos = rootStore.pianoRollStore.getLocal(e)

    observeDrag2(e, {
      onMouseMove: (_e, delta) => {
        const local = pointAdd(startPos, delta)
        const tick = rootStore.pianoRollStore.transform.getTicks(local.x)
        resizeSelectionLeft(rootStore)(tick)
      },
    })
  }

const dragSelectionRightEdgeAction =
  (_selection: Selection): MouseGesture =>
  (rootStore) =>
  (e) => {
    const startPos = rootStore.pianoRollStore.getLocal(e)

    observeDrag2(e, {
      onMouseMove: (_e, delta) => {
        const local = pointAdd(startPos, delta)
        const tick = rootStore.pianoRollStore.transform.getTicks(local.x)
        resizeSelectionRight(rootStore)(tick)
      },
    })
  }
