import { observer } from "mobx-react-lite"
import { useCallback, VFC } from "react"
import { IPoint } from "../../../../common/geometry"
import { Layout } from "../../../Constants"
import { useStores } from "../../../hooks/useStores"
import { GLSurface } from "../../GLSurface/GLSurface"
import { handleCreateSelectionDrag } from "../MouseHandler/handleCreateSelectionDrag"
import { handlePencilMouseDown } from "../MouseHandler/handlePencilMouseDown"
import { handleSelectionDragEvents } from "../MouseHandler/handleSelectionDragEvents"

export const TempoGraphCanvas: VFC = observer(() => {
  const rootStore = useStores()

  const {
    items,
    transform,
    scrollLeft: _scrollLeft,
    cursorX,
    contentWidth,
    selection,
    mouseMode,
    selectedEventIds,
  } = rootStore.tempoEditorStore
  const { beats } = rootStore.tempoEditorStore.rulerStore

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
          transform
        )
      } else {
        handleCreateSelectionDrag(rootStore)(ev.nativeEvent, local, transform)
      }
    },
    [rootStore, transform, scrollLeft, renderer, items]
  )

  return (
    <GLSurface
      width={containerWidth}
      height={contentHeight}
      onMouseDown={onMouseDownGraph}
      onWheel={onWheelGraph}
      style={{
        position: "absolute",
        top: Layout.rulerHeight,
        left: Layout.keyWidth,
      }}
    ></GLSurface>
  )
})
