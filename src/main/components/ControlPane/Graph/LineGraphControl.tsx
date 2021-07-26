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
import { TrackEventOf } from "../../../../common/track"
import { ControlCoordTransform } from "../../../../common/transform/ControlCoordTransform"
import { createOrUpdateControlEventsValue } from "../../../actions/control"
import { useContextMenu } from "../../../hooks/useContextMenu"
import { useStores } from "../../../hooks/useStores"
import { useTheme } from "../../../hooks/useTheme"
import { GLCanvas } from "../../GLCanvas/GLCanvas"
import { useControlPaneKeyboardShortcut } from "../../KeyboardShortcut/useControlPaneKeyboardShortcut"
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
          (p) => renderer.hitTest(p),
          createEvent
        )
      },
      [rootStore, scrollLeft, renderer, controlTransform, createEvent]
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

    const onKeyDown = useControlPaneKeyboardShortcut()

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
        mappedBeats,
        [],
        cursorX,
        scrollLeft
      )
    }, [renderer, scrollLeft, mappedBeats, cursorX, items, controlTransform])

    const onClickAxis = (value: number) => {
      const event = createEvent(value)
      createOrUpdateControlEventsValue(rootStore)(event)
    }

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
          style={{ outline: "none", cursor: controlCursor }}
          tabIndex={-1}
          onMouseDown={onMouseDown}
          onKeyDown={onKeyDown}
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
