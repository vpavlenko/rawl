import { partition } from "lodash"
import { ControllerEvent, PitchBendEvent } from "midifile-ts"
import { observer } from "mobx-react-lite"
import React, {
  KeyboardEventHandler,
  useCallback,
  useEffect,
  useState,
} from "react"
import { IPoint } from "../../../../common/geometry"
import { TrackEventOf } from "../../../../common/track"
import { createEvent as createTrackEvent } from "../../../actions"
import { pushHistory } from "../../../actions/history"
import { useStores } from "../../../hooks/useStores"
import { useTheme } from "../../../hooks/useTheme"
import { GLCanvas } from "../../GLCanvas/GLCanvas"
import { observeDrag } from "../../PianoRoll/MouseHandler/observeDrag"
import { GraphAxis } from "./GraphAxis"
import { LineGraphRenderer } from "./LineGraphRenderer"

interface ItemValue {
  tick: number
  value: number
}

export interface LineGraphControlProps<
  T extends ControllerEvent | PitchBendEvent
> {
  width: number
  height: number
  maxValue: number
  events: TrackEventOf<T>[]
  createEvent: (value: number) => T
  lineWidth?: number
  circleRadius?: number
  axis: number[]
  axisLabelFormatter?: (value: number) => string
}

const LineGraphControl = observer(
  <T extends ControllerEvent | PitchBendEvent>({
    maxValue,
    events,
    createEvent,
    width,
    height,
    lineWidth = 2,
    circleRadius = 4,
    axis,
    axisLabelFormatter = (v) => v.toString(),
  }: LineGraphControlProps<T>) => {
    const theme = useTheme()
    const rootStore = useStores()
    const {
      mappedBeats,
      cursorX,
      scrollLeft,
      transform,
      selectedControllerEventId,
      controlCursor,
    } = rootStore.pianoRollStore

    function transformToPosition(tick: number, value: number) {
      return {
        x: Math.round(transform.getX(tick)),
        y:
          Math.round((1 - value / maxValue) * (height - lineWidth * 2)) +
          lineWidth,
      }
    }

    function transformFromPosition(position: IPoint): ItemValue {
      return {
        tick: transform.getTicks(position.x),
        value:
          (1 - (position.y - lineWidth) / (height - lineWidth * 2)) * maxValue,
      }
    }

    const items = events.map((e) => ({
      id: e.id,
      ...transformToPosition(e.tick, e.value),
    }))

    const [renderer, setRenderer] = useState<LineGraphRenderer | null>(null)

    const onMouseDown = useCallback(
      (ev: React.MouseEvent) => {
        if (renderer === null) {
          return
        }

        const { selectedTrack } = rootStore.song
        if (selectedTrack === undefined) {
          return
        }

        const getLocal = (e: MouseEvent): IPoint => ({
          x: e.offsetX + scrollLeft,
          y: e.offsetY,
        })
        const local = getLocal(ev.nativeEvent)
        const hitEventId = renderer.hitTest(local)

        let eventId: number
        if (hitEventId === undefined) {
          const pos = transformFromPosition(local)
          const event = createEvent(pos.value)
          eventId = createTrackEvent(rootStore)(event, pos.tick)
          rootStore.pianoRollStore.selectedControllerEventId = eventId
        } else {
          eventId = hitEventId
          rootStore.pianoRollStore.selectedControllerEventId = hitEventId
        }

        pushHistory(rootStore)()
        observeDrag({
          onMouseMove: (e) => {
            const local = getLocal(e)
            const value = transformFromPosition(local).value
            selectedTrack.updateEvent(eventId, { value })
          },
        })
      },
      [rootStore, transform, lineWidth, scrollLeft, renderer]
    )

    const onKeyDown: KeyboardEventHandler = useCallback(
      (e) => {
        const { selectedControllerEventId: eventId } = rootStore.pianoRollStore
        if (eventId === null) {
          return
        }
        switch (e.key) {
          case "Backspace":
          case "Delete":
            rootStore.song.selectedTrack?.removeEvent(eventId)
        }
      },
      [rootStore]
    )

    useEffect(() => {
      if (renderer === null) {
        return
      }

      const [highlightedBeats, nonHighlightedBeats] = partition(
        mappedBeats,
        (b) => b.beat === 0
      )

      renderer.theme = theme
      renderer.render(
        lineWidth,
        circleRadius,
        items,
        selectedControllerEventId,
        nonHighlightedBeats.map((b) => b.x),
        highlightedBeats.map((b) => b.x),
        [],
        cursorX,
        scrollLeft
      )
    }, [renderer, scrollLeft, mappedBeats, cursorX, items])

    const onClickAxis = (value: number) => {
      const { selectedTrack } = rootStore.song
      if (selectedTrack === undefined) {
        return
      }
      const { selectedControllerEventId } = rootStore.pianoRollStore

      const event = createEvent(value)
      pushHistory(rootStore)()
      if (
        selectedControllerEventId !== null &&
        selectedTrack.getEventById(selectedControllerEventId) !== undefined
      ) {
        selectedTrack.updateEvent(selectedControllerEventId, event)
      } else {
        selectedTrack.createOrUpdate({
          ...event,
          tick: rootStore.services.player.position,
        })
      }
    }

    return (
      <div
        style={{
          display: "flex",
        }}
      >
        <GraphAxis
          values={axis}
          valueFormatter={axisLabelFormatter}
          onClick={onClickAxis}
        />
        <GLCanvas
          style={{ outline: "none", cursor: controlCursor }}
          tabIndex={0}
          onMouseDown={onMouseDown}
          onKeyDown={onKeyDown}
          onCreateContext={useCallback(
            (gl) => setRenderer(new LineGraphRenderer(gl)),
            []
          )}
          width={width}
          height={height}
        />
      </div>
    )
  }
)

export default React.memo(LineGraphControl)
