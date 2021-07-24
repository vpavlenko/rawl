import { ControllerEvent, PitchBendEvent } from "midifile-ts"
import { IPoint, pointAdd, pointSub } from "../../../../../common/geometry"
import { isNotUndefined } from "../../../../../common/helpers/array"
import { TrackEventOf } from "../../../../../common/track"
import { ControlCoordTransform } from "../../../../../common/transform/ControlCoordTransform"
import { pushHistory } from "../../../../actions/history"
import { getClientPos } from "../../../../helpers/mouseEvent"
import RootStore from "../../../../stores/RootStore"
import { observeDrag } from "../../../PianoRoll/MouseHandler/observeDrag"

export const handleSelectionDragEvents =
  (rootStore: RootStore) =>
  <T extends ControllerEvent | PitchBendEvent>(
    e: MouseEvent,
    hitEventId: number,
    startPoint: IPoint,
    transform: ControlCoordTransform
  ) => {
    const { selectedTrack } = rootStore.song
    if (selectedTrack === undefined) {
      return
    }

    pushHistory(rootStore)()

    if (
      !rootStore.pianoRollStore.selectedControllerEventIds.includes(hitEventId)
    ) {
      rootStore.pianoRollStore.selectedControllerEventIds = [hitEventId]
    }

    const controllerEvents = rootStore.pianoRollStore.selectedControllerEventIds
      .map((id) => selectedTrack.getEventById(id) as unknown as TrackEventOf<T>)
      .filter(isNotUndefined)
      .map((e) => ({ ...e })) // copy

    const draggedEvent = controllerEvents.find((ev) => ev.id === hitEventId)
    if (draggedEvent === undefined) {
      return
    }

    const start = transform.fromPosition(startPoint)
    const startClientPos = getClientPos(e)

    observeDrag({
      onMouseMove: (e) => {
        const posPx = getClientPos(e)
        const deltaPx = pointSub(posPx, startClientPos)
        const local = pointAdd(startPoint, deltaPx)
        const pos = transform.fromPosition(local)
        const deltaTick = pos.tick - start.tick
        const offsetTick =
          draggedEvent.tick +
          deltaTick -
          rootStore.pianoRollStore.quantizer.round(
            draggedEvent.tick + deltaTick
          )
        const quantizedDeltaTick = deltaTick - offsetTick

        const deltaValue = pos.value - start.value
        selectedTrack.updateEvents(
          controllerEvents.map((ev) => ({
            id: ev.id,
            tick: Math.max(0, Math.floor(ev.tick + quantizedDeltaTick)),
            value: Math.min(
              transform.maxValue,
              Math.max(0, Math.floor(ev.value + deltaValue))
            ),
          }))
        )
      },
    })
  }
