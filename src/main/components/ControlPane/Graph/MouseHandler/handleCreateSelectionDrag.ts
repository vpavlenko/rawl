import { IPoint, pointAdd, pointSub } from "../../../../../common/geometry"
import { ControlSelection } from "../../../../../common/selection/ControlSelection"
import { getClientPos } from "../../../../helpers/mouseEvent"
import RootStore from "../../../../stores/RootStore"
import { observeDrag } from "../../../PianoRoll/MouseHandler/observeDrag"
import { ItemValue } from "../LineGraphControl"

export const handleCreateSelectionDrag =
  (rootStore: RootStore) =>
  (
    e: MouseEvent,
    startPoint: IPoint,
    transformFromPosition: (position: IPoint) => ItemValue,
    getControllerEventIdsInSelection: (selection: ControlSelection) => number[]
  ) => {
    rootStore.pianoRollStore.selectedControllerEventIds = []

    const start = transformFromPosition(startPoint)
    const startClientPos = getClientPos(e)

    rootStore.pianoRollStore.selection = null

    rootStore.pianoRollStore.controlSelection = {
      fromTick: start.tick,
      toTick: start.tick,
    }

    observeDrag({
      onMouseMove: (e) => {
        const posPx = getClientPos(e)
        const deltaPx = pointSub(posPx, startClientPos)
        const local = pointAdd(startPoint, deltaPx)
        const end = transformFromPosition(local)
        rootStore.pianoRollStore.controlSelection = {
          fromTick: Math.min(start.tick, end.tick),
          toTick: Math.max(start.tick, end.tick),
        }
      },
      onMouseUp: (e) => {
        const { controlSelection } = rootStore.pianoRollStore
        if (controlSelection === null) {
          return
        }

        rootStore.pianoRollStore.selectedControllerEventIds =
          getControllerEventIdsInSelection(controlSelection)
        rootStore.pianoRollStore.controlSelection = null
      },
    })
  }
