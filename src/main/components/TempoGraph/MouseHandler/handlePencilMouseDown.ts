import { IPoint, pointAdd, pointSub } from "../../../../common/geometry"
import { bpmToUSecPerBeat } from "../../../../common/helpers/bpm"
import { setTempoMidiEvent } from "../../../../common/midi/MidiEvent"
import { isSetTempoEvent } from "../../../../common/track"
import { TempoCoordTransform } from "../../../../common/transform"
import { updateEventsInRange } from "../../../actions"
import { pushHistory } from "../../../actions/history"
import { getClientPos } from "../../../helpers/mouseEvent"
import { observeDrag } from "../../../helpers/observeDrag"
import RootStore from "../../../stores/RootStore"

export const handlePencilMouseDown =
  (rootStore: RootStore) =>
  (e: MouseEvent, startPoint: IPoint, transform: TempoCoordTransform) => {
    const {
      song,
      tempoEditorStore: { quantizer },
    } = rootStore

    const track = song.conductorTrack
    if (track === undefined) {
      return
    }

    pushHistory(rootStore)()

    const startClientPos = getClientPos(e)
    const pos = transform.fromPosition(startPoint)
    const bpm = bpmToUSecPerBeat(pos.bpm)

    const event = {
      ...setTempoMidiEvent(0, Math.round(bpm)),
      tick: quantizer.round(pos.tick),
    }
    track.createOrUpdate(event)

    let lastTick = pos.tick
    let lastValue = pos.bpm

    observeDrag({
      onMouseMove: (e) => {
        const posPx = getClientPos(e)
        const deltaPx = pointSub(posPx, startClientPos)
        const local = pointAdd(startPoint, deltaPx)
        const value = Math.max(
          0,
          Math.min(transform.maxBPM, transform.fromPosition(local).bpm),
        )
        const tick = transform.getTicks(local.x)

        updateEventsInRange(track, quantizer, isSetTempoEvent, (v) =>
          setTempoMidiEvent(0, bpmToUSecPerBeat(v)),
        )(lastValue, value, lastTick, tick)

        lastTick = tick
        lastValue = value
      },
    })
  }
