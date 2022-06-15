import { IPoint, pointAdd } from "../../../../../common/geometry"
import { ControlSelection } from "../../../../../common/selection/ControlSelection"
import { ControlCoordTransform } from "../../../../../common/transform/ControlCoordTransform"
import { observeDrag2 } from "../../../../helpers/observeDrag"
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
      player,
    } = rootStore
    pianoRollStore.selectedControllerEventIds = []

    const startTick = quantizer.round(controlTransform.getTicks(startPoint.x))

    pianoRollStore.selection = null
    pianoRollStore.selectedNoteIds = []

    if (!player.isPlaying) {
      player.position = startTick
    }

    pianoRollStore.controlSelection = {
      fromTick: startTick,
      toTick: startTick,
    }

    observeDrag2(e, {
      onMouseMove: (_e, delta) => {
        const local = pointAdd(startPoint, delta)
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
