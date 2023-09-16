import { clamp } from "lodash"
import { SetTempoEvent } from "midifile-ts"
import { IPoint, pointAdd, pointSub } from "../../../../common/geometry"
import { isNotUndefined } from "../../../../common/helpers/array"
import {
  bpmToUSecPerBeat,
  uSecPerBeatToBPM,
} from "../../../../common/helpers/bpm"
import { TrackEventOf } from "../../../../common/track"
import { TempoCoordTransform } from "../../../../common/transform"
import { pushHistory } from "../../../actions/history"
import { getClientPos } from "../../../helpers/mouseEvent"
import { observeDrag } from "../../../helpers/observeDrag"
import RootStore from "../../../stores/RootStore"

export const handleSelectionDragEvents =
  (rootStore: RootStore) =>
  (
    e: MouseEvent,
    hitEventId: number,
    startPoint: IPoint,
    transform: TempoCoordTransform,
  ) => {
    const {
      song: { conductorTrack },
      tempoEditorStore,
      tempoEditorStore: { quantizer },
    } = rootStore

    if (conductorTrack === undefined) {
      return
    }

    pushHistory(rootStore)()

    if (!tempoEditorStore.selectedEventIds.includes(hitEventId)) {
      tempoEditorStore.selectedEventIds = [hitEventId]
    }

    const events = tempoEditorStore.selectedEventIds
      .map(
        (id) =>
          conductorTrack.getEventById(
            id,
          ) as unknown as TrackEventOf<SetTempoEvent>,
      )
      .filter(isNotUndefined)
      .map((e) => ({ ...e })) // copy

    const draggedEvent = events.find((ev) => ev.id === hitEventId)
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
          quantizer.round(draggedEvent.tick + deltaTick)
        const quantizedDeltaTick = deltaTick - offsetTick

        const deltaValue = pos.bpm - start.bpm

        conductorTrack.updateEvents(
          events.map((ev) => ({
            id: ev.id,
            tick: Math.max(0, Math.floor(ev.tick + quantizedDeltaTick)),
            microsecondsPerBeat: Math.floor(
              bpmToUSecPerBeat(
                clamp(
                  uSecPerBeatToBPM(ev.microsecondsPerBeat) + deltaValue,
                  0,
                  transform.maxBPM,
                ),
              ),
            ),
          })),
        )
      },
    })
  }
