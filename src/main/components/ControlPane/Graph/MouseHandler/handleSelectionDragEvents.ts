import { ControllerEvent, PitchBendEvent } from "midifile-ts"
import { IPoint, pointAdd, pointSub } from "../../../../../common/geometry"
import { isNotUndefined } from "../../../../../common/helpers/array"
import { TrackEventOf } from "../../../../../common/track"
import { pushHistory } from "../../../../actions/history"
import { getClientPos } from "../../../../helpers/mouseEvent"
import RootStore from "../../../../stores/RootStore"
import { observeDrag } from "../../../PianoRoll/MouseHandler/observeDrag"
import { ItemValue } from "../LineGraphControl"

export const handleSelectionDragEvents =
  (rootStore: RootStore) =>
  <T extends ControllerEvent | PitchBendEvent>(
    e: MouseEvent,
    hitEventId: number,
    startPoint: IPoint,
    maxValue: number,
    transformFromPosition: (position: IPoint) => ItemValue
  ) => {
    const { selectedTrack } = rootStore.song
    if (selectedTrack === undefined) {
      return
    }

    pushHistory(rootStore)()

    const controllerEvents = rootStore.pianoRollStore.selectedControllerEventIds
      .map((id) => selectedTrack.getEventById(id) as unknown as TrackEventOf<T>)
      .filter(isNotUndefined)
      .map((e) => ({ ...e })) // copy

    const draggedEvent = controllerEvents.find((ev) => ev.id === hitEventId)
    if (draggedEvent === undefined) {
      return
    }

    const start = transformFromPosition(startPoint)
    const startClientPos = getClientPos(e)

    observeDrag({
      onMouseMove: (e) => {
        const posPx = getClientPos(e)
        const deltaPx = pointSub(posPx, startClientPos)
        const local = pointAdd(startPoint, deltaPx)
        const pos = transformFromPosition(local)
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
              maxValue,
              Math.max(0, Math.floor(ev.value + deltaValue))
            ),
          }))
        )
      },
    })
  }
