import { ControllerEvent, PitchBendEvent } from "midifile-ts"
import { observer } from "mobx-react-lite"
import React, {
  MouseEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"
import { IPoint, zeroRect } from "../../../../common/geometry"
import { filterEventsWithRange } from "../../../../common/helpers/filterEventsWithScroll"
import {
  createValueEvent,
  ValueEventType,
} from "../../../../common/helpers/valueEvent"
import { TrackEventOf } from "../../../../common/track"
import { ControlCoordTransform } from "../../../../common/transform/ControlCoordTransform"
import { createOrUpdateControlEventsValue } from "../../../actions/control"
import { useContextMenu } from "../../../hooks/useContextMenu"
import { useStores } from "../../../hooks/useStores"
import { useTheme } from "../../../hooks/useTheme"
import { GLCanvas } from "../../GLCanvas/GLCanvas"
import { ControlSelectionContextMenu } from "../ControlSelectionContextMenu"
import { GraphAxis } from "./GraphAxis"
import { LineGraphRenderer } from "./LineGraphRenderer"
import { handleCreateSelectionDrag } from "./MouseHandler/handleCreateSelectionDrag"
import { handlePencilMouseDown } from "./MouseHandler/handlePencilMouseDown"
import { handleSelectionDragEvents } from "./MouseHandler/handleSelectionDragEvents"

export interface ItemValue {
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
  eventType: ValueEventType
  lineWidth?: number
  circleRadius?: number
  axis: number[]
  axisLabelFormatter?: (value: number) => string
}

const LineGraphControl = observer(
  <T extends ControllerEvent | PitchBendEvent>({
    maxValue,
    events,
    eventType,
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
      cursorX,
      scrollLeft,
      transform,
      selectedControllerEventIds,
      controlCursor,
      controlSelection,
      mouseMode,
    } = rootStore.pianoRollStore
    const { beats } = rootStore.pianoRollStore.rulerStore

    const controlTransform = useMemo(
      () =>
        new ControlCoordTransform(
          transform.pixelsPerTick,
          maxValue,
          height,
          lineWidth
        ),
      [transform.pixelsPerTick, maxValue, height, lineWidth]
    )

    const items = events.map((e) => ({
      id: e.id,
      ...controlTransform.toPosition(e.tick, e.value),
    }))

    const [renderer, setRenderer] = useState<LineGraphRenderer | null>(null)

    const getLocal = (e: MouseEvent): IPoint => ({
      x: e.offsetX + scrollLeft,
      y: e.offsetY,
    })

    const pencilMouseDown: MouseEventHandler = useCallback(
      (ev) => {
        if (renderer === null) {
          return
        }

        const local = getLocal(ev.nativeEvent)

        handlePencilMouseDown(rootStore)(
          ev.nativeEvent,
          local,
          controlTransform,
          eventType
        )
      },
      [rootStore, scrollLeft, renderer, controlTransform, eventType]
    )

    const selectionMouseDown: MouseEventHandler = useCallback(
      (ev) => {
        if (renderer === null) {
          return
        }

        const local = getLocal(ev.nativeEvent)
        const hitEventId = renderer.hitTest(local)

        if (hitEventId !== undefined) {
          handleSelectionDragEvents(rootStore)(
            ev.nativeEvent,
            hitEventId,
            local,
            controlTransform
          )
        } else {
          handleCreateSelectionDrag(rootStore)(
            ev.nativeEvent,
            local,
            controlTransform,
            (s) =>
              filterEventsWithRange(events, s.fromTick, s.toTick).map(
                (e) => e.id
              )
          )
        }
      },
      [rootStore, controlTransform, scrollLeft, renderer, events]
    )

    const onMouseDown =
      mouseMode === "pencil" ? pencilMouseDown : selectionMouseDown

    useEffect(() => {
      if (renderer === null) {
        return
      }

      const selectionRect =
        controlSelection !== null
          ? controlTransform.transformSelection(controlSelection)
          : zeroRect

      renderer.theme = theme
      renderer.render(
        lineWidth,
        circleRadius,
        items,
        selectedControllerEventIds,
        selectionRect,
        beats,
        [],
        cursorX,
        scrollLeft
      )
    }, [renderer, scrollLeft, beats, cursorX, items, controlTransform])

    const onClickAxis = useCallback(
      (value: number) => {
        const event = createValueEvent(eventType, value)
        createOrUpdateControlEventsValue(rootStore)(event)
      },
      [eventType]
    )

    const { onContextMenu, menuProps } = useContextMenu()

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
          style={{ cursor: controlCursor }}
          onMouseDown={onMouseDown}
          onContextMenu={onContextMenu}
          onCreateContext={useCallback(
            (gl) => setRenderer(new LineGraphRenderer(gl)),
            []
          )}
          width={width}
          height={height}
        />
        <ControlSelectionContextMenu {...menuProps} />
      </div>
    )
  }
)

export default React.memo(LineGraphControl)
