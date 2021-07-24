import { ControllerEvent, PitchBendEvent } from "midifile-ts"
import { IPoint, pointAdd, pointSub } from "../../../../../common/geometry"
import { ControlCoordTransform } from "../../../../../common/transform/ControlCoordTransform"
import { createEvent as createTrackEvent } from "../../../../actions"
import { pushHistory } from "../../../../actions/history"
import { getClientPos } from "../../../../helpers/mouseEvent"
import RootStore from "../../../../stores/RootStore"
import { observeDrag } from "../../../PianoRoll/MouseHandler/observeDrag"

export const handlePencilMouseDown =
  (rootStore: RootStore) =>
  <T extends ControllerEvent | PitchBendEvent>(
    e: MouseEvent,
    startPoint: IPoint,
    transform: ControlCoordTransform,
    getHitControllerEvent: (point: IPoint) => number | undefined,
    createEvent: (value: number) => T
  ) => {
    const { selectedTrack } = rootStore.song
    if (selectedTrack === undefined) {
      return
    }

    const hitEventId = getHitControllerEvent(startPoint)
    const startClientPos = getClientPos(e)

    let eventId: number
    if (hitEventId === undefined) {
      const pos = transform.transformFromPosition(startPoint)
      const event = createEvent(pos.value)
      eventId = createTrackEvent(rootStore)(event, pos.tick)
      rootStore.pianoRollStore.selectedControllerEventIds = [eventId]
    } else {
      eventId = hitEventId
      rootStore.pianoRollStore.selectedControllerEventIds = [hitEventId]
    }

    rootStore.pianoRollStore.controlSelection = null
    rootStore.pianoRollStore.selection = null

    pushHistory(rootStore)()
    observeDrag({
      onMouseMove: (e) => {
        const posPx = getClientPos(e)
        const deltaPx = pointSub(posPx, startClientPos)
        const local = pointAdd(startPoint, deltaPx)
        const value = Math.max(
          0,
          Math.min(
            transform.maxValue,
            transform.transformFromPosition(local).value
          )
        )
        selectedTrack.updateEvent(eventId, { value })
      },
    })
  }
