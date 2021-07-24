import { ControllerEvent, PitchBendEvent } from "midifile-ts"
import { observer } from "mobx-react-lite"
import React, {
  KeyboardEventHandler,
  MouseEventHandler,
  useCallback,
  useEffect,
  useState,
} from "react"
import { IPoint, IRect, zeroRect } from "../../../../common/geometry"
import { filterEventsWithRange } from "../../../../common/helpers/filterEventsWithScroll"
import { ControlSelection } from "../../../../common/selection/ControlSelection"
import { TrackEventOf } from "../../../../common/track"
import {
  createOrUpdateControlEventsValue,
  removeSelectedControlEvents,
} from "../../../actions/control"
import { useStores } from "../../../hooks/useStores"
import { useTheme } from "../../../hooks/useTheme"
import { GLCanvas } from "../../GLCanvas/GLCanvas"
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
      selectedControllerEventIds,
      controlCursor,
      controlSelection,
      mouseMode,
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

    const transformSelection = (selection: ControlSelection): IRect => {
      const x = transformToPosition(selection.fromTick, 0).x
      return {
        x,
        y: 0,
        width: transformToPosition(selection.toTick, 0).x - x,
        height,
      }
    }

    const items = events.map((e) => ({
      id: e.id,
      ...transformToPosition(e.tick, e.value),
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
          maxValue,
          transformFromPosition,
          (p) => renderer.hitTest(p),
          createEvent
        )
      },
      [
        rootStore,
        transform,
        lineWidth,
        scrollLeft,
        renderer,
        height,
        createEvent,
        maxValue,
      ]
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
            maxValue,
            transformFromPosition
          )
        } else {
          handleCreateSelectionDrag(rootStore)(
            ev.nativeEvent,
            local,
            transformFromPosition,
            (s) =>
              filterEventsWithRange(events, s.fromTick, s.toTick).map(
                (e) => e.id
              )
          )
        }
      },
      [
        rootStore,
        transform,
        lineWidth,
        scrollLeft,
        renderer,
        height,
        maxValue,
        events,
      ]
    )

    const onMouseDown =
      mouseMode === "pencil" ? pencilMouseDown : selectionMouseDown

    const onKeyDown: KeyboardEventHandler = useCallback(
      (e) => {
        switch (e.key) {
          case "Backspace":
          case "Delete":
            removeSelectedControlEvents(rootStore)()
        }
      },
      [rootStore]
    )

    useEffect(() => {
      if (renderer === null) {
        return
      }

      const selectionRect =
        controlSelection !== null
          ? transformSelection(controlSelection)
          : zeroRect

      renderer.theme = theme
      renderer.render(
        lineWidth,
        circleRadius,
        items,
        selectedControllerEventIds,
        selectionRect,
        mappedBeats,
        [],
        cursorX,
        scrollLeft
      )
    }, [renderer, scrollLeft, mappedBeats, cursorX, items])

    const onClickAxis = (value: number) => {
      const event = createEvent(value)
      createOrUpdateControlEventsValue(rootStore)(event)
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
