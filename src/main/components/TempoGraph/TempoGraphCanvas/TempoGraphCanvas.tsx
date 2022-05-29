import { observer } from "mobx-react-lite"
import { CSSProperties, useCallback, useMemo, VFC } from "react"
import { IPoint } from "../../../../common/geometry"
import {
  bpmToUSecPerBeat,
  uSecPerBeatToBPM,
} from "../../../../common/helpers/bpm"
import { getTempoSelectionBounds } from "../../../../common/selection/TempoSelection"
import { changeTempo } from "../../../actions"
import { matrixFromTranslation } from "../../../helpers/matrix"
import { useStores } from "../../../hooks/useStores"
import { Beats } from "../../GLSurface/common/Beats"
import { Cursor } from "../../GLSurface/common/Cursor"
import { Selection } from "../../GLSurface/common/Selection"
import { GLSurface } from "../../GLSurface/GLSurface"
import { Transform } from "../../GLSurface/Transform"
import { handleCreateSelectionDrag } from "../MouseHandler/handleCreateSelectionDrag"
import { handlePencilMouseDown } from "../MouseHandler/handlePencilMouseDown"
import { handleSelectionDragEvents } from "../MouseHandler/handleSelectionDragEvents"
import { Lines } from "./Lines"
import { TempoItems } from "./TempoItems"

export interface TempoGraphCanvasProps {
  width: number
  height: number
  style?: CSSProperties
}

export const TempoGraphCanvas: VFC<TempoGraphCanvasProps> = observer(
  ({ width, height, style }) => {
    const rootStore = useStores()

    const {
      items,
      transform,
      scrollLeft: _scrollLeft,
      mouseMode,
    } = rootStore.tempoEditorStore

    const scrollLeft = Math.floor(_scrollLeft)

    const getLocal = useCallback(
      (e: MouseEvent) => ({
        x: e.offsetX + scrollLeft,
        y: e.offsetY,
      }),
      [scrollLeft]
    )

    const findEvent = useCallback(
      (local: IPoint) =>
        items.find(
          (n) => local.x >= n.bounds.x && local.x < n.bounds.x + n.bounds.width
        ),
      [items]
    )

    const pencilMouseDown = useCallback(
      (e: React.MouseEvent) => {
        handlePencilMouseDown(rootStore)(
          e.nativeEvent,
          getLocal(e.nativeEvent),
          transform
        )
      },
      [rootStore, transform, scrollLeft, mouseMode]
    )

    const selectionMouseDown = useCallback(
      (ev: React.MouseEvent) => {
        const local = getLocal(ev.nativeEvent)
        const hitEventId = rootStore.tempoEditorStore.hitTest(local)

        if (hitEventId !== undefined) {
          handleSelectionDragEvents(rootStore)(
            ev.nativeEvent,
            hitEventId,
            local,
            transform
          )
        } else {
          handleCreateSelectionDrag(rootStore)(ev.nativeEvent, local, transform)
        }
      },
      [rootStore, transform, scrollLeft]
    )

    const onMouseDownGraph =
      mouseMode === "pencil" ? pencilMouseDown : selectionMouseDown

    const onWheelGraph = useCallback(
      (e: React.WheelEvent) => {
        const local = getLocal(e.nativeEvent)
        const item = findEvent(local)
        if (!item) {
          return
        }
        const event = items.filter((ev) => ev.id === item.id)[0]
        const movement = e.nativeEvent.deltaY > 0 ? -1 : 1
        const bpm = uSecPerBeatToBPM(event.microsecondsPerBeat)
        changeTempo(rootStore)(event.id, bpmToUSecPerBeat(bpm + movement))
      },
      [items, rootStore, scrollLeft]
    )

    const scrollXMatrix = useMemo(
      () => matrixFromTranslation(-scrollLeft, 0),
      [scrollLeft]
    )

    return (
      <GLSurface
        width={width}
        height={height}
        onMouseDown={onMouseDownGraph}
        onWheel={onWheelGraph}
        style={style}
      >
        <Lines width={width} />
        <Transform matrix={scrollXMatrix}>
          <TempoItems width={width} />
          <_Beats height={height} />
          <_Cursor height={height} />
          <_Selection />
        </Transform>
      </GLSurface>
    )
  }
)

const _Beats: VFC<{ height: number }> = observer(({ height }) => {
  const rootStore = useStores()
  const {
    rulerStore: { beats },
  } = rootStore.tempoEditorStore
  return <Beats height={height} beats={beats} />
})

const _Cursor: VFC<{ height: number }> = observer(({ height }) => {
  const rootStore = useStores()
  const { cursorX } = rootStore.tempoEditorStore
  return <Cursor x={cursorX} height={height} />
})

const _Selection = observer(() => {
  const rootStore = useStores()
  const { selection, transform } = rootStore.tempoEditorStore
  const selectionRect =
    selection != null ? getTempoSelectionBounds(selection, transform) : null
  return <Selection rect={selectionRect} />
})
