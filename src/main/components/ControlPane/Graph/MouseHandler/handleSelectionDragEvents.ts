import { ControllerEvent, PitchBendEvent } from "midifile-ts"
import { IPoint } from "../../../../../common/geometry"
import { ValueEventType } from "../../../../../common/helpers/valueEvent"
import { TrackEventOf } from "../../../../../common/track"
import { ControlCoordTransform } from "../../../../../common/transform/ControlCoordTransform"
import { pushHistory } from "../../../../actions/history"
import { observeDrag2 } from "../../../../helpers/observeDrag"
import RootStore from "../../../../stores/RootStore"

export const handleSelectionDragEvents =
  (rootStore: RootStore) =>
  <T extends ControllerEvent | PitchBendEvent>(
    e: MouseEvent,
    hitEventId: number,
    startPoint: IPoint,
    transform: ControlCoordTransform,
    type: ValueEventType,
  ) => {
    const {
      controlStore,
      controlStore: { selectedTrack },
    } = rootStore
    if (selectedTrack === undefined) {
      return
    }

    pushHistory(rootStore)()

    if (!controlStore.selectedEventIds.includes(hitEventId)) {
      controlStore.selectedEventIds = [hitEventId]
    }

    const controllerEvents = selectedTrack.events
      .filter((e) => controlStore.selectedEventIds.includes(e.id))
      .map((e) => ({ ...e }) as unknown as TrackEventOf<T>) // copy

    const draggedEvent = controllerEvents.find((ev) => ev.id === hitEventId)
    if (draggedEvent === undefined) {
      return
    }

    const startValue = transform.getValue(startPoint.y)

    observeDrag2(e, {
      onMouseMove: (_e, delta) => {
        const deltaTick = transform.getTicks(delta.x)
        const offsetTick =
          draggedEvent.tick +
          deltaTick -
          controlStore.quantizer.round(draggedEvent.tick + deltaTick)
        const quantizedDeltaTick = deltaTick - offsetTick

        const currentValue = transform.getValue(startPoint.y + delta.y)
        const deltaValue = currentValue - startValue

        selectedTrack.updateEvents(
          controllerEvents.map((ev) => ({
            id: ev.id,
            tick: Math.max(0, Math.floor(ev.tick + quantizedDeltaTick)),
            value: Math.min(
              transform.maxValue,
              Math.max(0, Math.floor(ev.value + deltaValue)),
            ),
          })),
        )
      },

      onMouseUp: (_e) => {
        // Find events with the same tick and remove it
        const controllerEvents = selectedTrack.events.filter((e) =>
          controlStore.selectedEventIds.includes(e.id),
        )

        selectedTrack.transaction((it) =>
          controllerEvents.forEach((e) => it.removeRedundantEvents(e)),
        )
      },
    })
  }
