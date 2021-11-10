import { ControllerEvent, PitchBendEvent } from "midifile-ts"
import { IPoint, pointAdd, pointSub } from "../../../../../common/geometry"
import { ControlCoordTransform } from "../../../../../common/transform/ControlCoordTransform"
import {
  createEvent as createTrackEvent,
  updateControllersValue,
  updatePitchbendValue,
} from "../../../../actions"
import { pushHistory } from "../../../../actions/history"
import { getClientPos } from "../../../../helpers/mouseEvent"
import { observeDrag } from "../../../../helpers/observeDrag"
import RootStore from "../../../../stores/RootStore"

export const handlePencilMouseDown =
  (rootStore: RootStore) =>
  <T extends ControllerEvent | PitchBendEvent>(
    e: MouseEvent,
    startPoint: IPoint,
    transform: ControlCoordTransform,
    createEvent: (value: number) => T
  ) => {
    const { selectedTrack } = rootStore.song
    if (selectedTrack === undefined) {
      return
    }

    const startClientPos = getClientPos(e)

    rootStore.pianoRollStore.selectedControllerEventIds = []
    rootStore.pianoRollStore.controlSelection = null
    rootStore.pianoRollStore.selection = null

    const pos = transform.fromPosition(startPoint)
    const event = createEvent(pos.value)
    createTrackEvent(rootStore)(event, pos.tick)

    pushHistory(rootStore)()

    let lastTick = pos.tick
    let lastValue = pos.value

    observeDrag({
      onMouseMove: (e) => {
        const posPx = getClientPos(e)
        const deltaPx = pointSub(posPx, startClientPos)
        const local = pointAdd(startPoint, deltaPx)
        const value = Math.max(
          0,
          Math.min(transform.maxValue, transform.fromPosition(local).value)
        )
        const tick = transform.getTicks(local.x)

        if (event.subtype === "controller") {
          updateControllersValue(event.controllerType)(rootStore)(
            lastValue,
            value,
            lastTick,
            tick
          )
        } else {
          updatePitchbendValue(rootStore)(lastValue, value, lastTick, tick)
        }

        lastTick = tick
        lastValue = value
      },
    })
  }
