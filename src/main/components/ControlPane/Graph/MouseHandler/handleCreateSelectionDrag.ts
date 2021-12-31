import { IPoint, pointAdd, pointSub } from "../../../../../common/geometry"
import { ControlSelection } from "../../../../../common/selection/ControlSelection"
import { ControlCoordTransform } from "../../../../../common/transform/ControlCoordTransform"
import { getClientPos } from "../../../../helpers/mouseEvent"
import { observeDrag } from "../../../../helpers/observeDrag"
import RootStore from "../../../../stores/RootStore"

export const handleCreateSelectionDrag =
  (rootStore: RootStore) =>
  (
    e: MouseEvent,
    startPoint: IPoint,
    controlTransform: ControlCoordTransform,
    getControllerEventIdsInSelection: (selection: ControlSelection) => number[]
  ) => {
    const {
      pianoRollStore,
      pianoRollStore: { quantizer },
      services: { player },
    } = rootStore
    pianoRollStore.selectedControllerEventIds = []

    const startTick = quantizer.round(controlTransform.getTicks(startPoint.x))
    const startClientPos = getClientPos(e)

    pianoRollStore.selection = null
    pianoRollStore.selectedNoteIds = []

    if (!player.isPlaying) {
      player.position = startTick
    }

    pianoRollStore.controlSelection = {
      fromTick: startTick,
      toTick: startTick,
    }

    observeDrag({
      onMouseMove: (e) => {
        const posPx = getClientPos(e)
        const deltaPx = pointSub(posPx, startClientPos)
        const local = pointAdd(startPoint, deltaPx)
        const endTick = quantizer.round(controlTransform.getTicks(local.x))
        pianoRollStore.controlSelection = {
          fromTick: Math.min(startTick, endTick),
          toTick: Math.max(startTick, endTick),
        }
      },
      onMouseUp: (_e) => {
        const { controlSelection } = pianoRollStore
        if (controlSelection === null) {
          return
        }

        pianoRollStore.selectedControllerEventIds =
          getControllerEventIdsInSelection(controlSelection)
        pianoRollStore.controlSelection = null
      },
    })
  }
