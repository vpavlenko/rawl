import styled from "@emotion/styled"
import useComponentSize from "@rehooks/component-size"
import { range } from "lodash"
import { observer } from "mobx-react-lite"
import React, { FC, useCallback, useEffect, useRef, useState } from "react"
import { IPoint } from "../../../common/geometry"
import { bpmToUSecPerBeat, uSecPerBeatToBPM } from "../../../common/helpers/bpm"
import { getTempoSelectionBounds } from "../../../common/selection/TempoSelection"
import { changeTempo as _changeTempo } from "../../actions"
import { Layout } from "../../Constants"
import { useStores } from "../../hooks/useStores"
import { useTheme } from "../../hooks/useTheme"
import { LineGraphRenderer } from "../ControlPane/Graph/LineGraphRenderer"
import { GLCanvas } from "../GLCanvas/GLCanvas"
import { BAR_WIDTH, HorizontalScrollBar } from "../inputs/ScrollBar"
import CanvasPianoRuler from "../PianoRoll/CanvasPianoRuler"
import { handleCreateSelectionDrag } from "./MouseHandler/handleCreateSelectionDrag"
import { handlePencilMouseDown } from "./MouseHandler/handlePencilMouseDown"
import { handleSelectionDragEvents } from "./MouseHandler/handleSelectionDragEvents"
import { TempoGraphAxis } from "./TempoGraphAxis"

const Wrapper = styled.div`
  position: relative;
  flex-grow: 1;
  background: ${({ theme }) => theme.backgroundColor};
  color: ${({ theme }) => theme.secondaryTextColor};
`

export const TempoGraph: FC = observer(() => {
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

  const ref = useRef(null)
  const size = useComponentSize(ref)

  const setScrollLeft = useCallback(
    (x: number) => (rootStore.tempoEditorStore.scrollLeft = x),
    []
  )
  const theme = useTheme()

  const changeTempo = _changeTempo(rootStore)

  const [renderer, setRenderer] = useState<LineGraphRenderer | null>(null)

  const scrollLeft = Math.floor(_scrollLeft)

  const containerWidth = size.width
  const containerHeight = size.height

  const contentHeight = containerHeight - Layout.rulerHeight - BAR_WIDTH

  useEffect(() => {
    rootStore.tempoEditorStore.canvasWidth = containerWidth
    rootStore.tempoEditorStore.canvasHeight = contentHeight
  }, [containerWidth, contentHeight])

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
      changeTempo(event.id, bpmToUSecPerBeat(bpm + movement))
    },
    [items, rootStore]
  )

  useEffect(() => {
    if (renderer === null) {
      return
    }

    // 30 -> 510 = 17 Divided line
    const lines = range(30, transform.maxBPM, 30).map((i) => transform.getY(i))

    const selectionRect =
      selection != null ? getTempoSelectionBounds(selection, transform) : null

    const lineWidth = 2
    const circleRadius = 4

    renderer.theme = theme

    renderer.render(
      lineWidth,
      circleRadius,
      items.map((i) => ({ ...i.bounds, id: i.id })),
      selectedEventIds,
      selectionRect,
      beats,
      lines,
      cursorX,
      scrollLeft
    )
  }, [
    items,
    beats,
    theme,
    scrollLeft,
    cursorX,
    selection,
    transform,
    selectedEventIds,
  ])

  return (
    <Wrapper ref={ref}>
      <CanvasPianoRuler
        rulerStore={rootStore.tempoEditorStore.rulerStore}
        style={{
          background: theme.backgroundColor,
          borderBottom: `1px solid ${theme.dividerColor}`,
          boxSizing: "border-box",
          position: "absolute",
          left: Layout.keyWidth,
        }}
      />
      <GLCanvas
        onCreateContext={useCallback(
          (gl) => setRenderer(new LineGraphRenderer(gl)),
          []
        )}
        width={containerWidth}
        height={contentHeight}
        onMouseDown={onMouseDownGraph}
        onWheel={onWheelGraph}
        style={{
          position: "absolute",
          top: Layout.rulerHeight,
          left: Layout.keyWidth,
        }}
      />
      <TempoGraphAxis
        width={Layout.keyWidth}
        offset={Layout.rulerHeight}
        transform={transform}
      />
      <HorizontalScrollBar
        scrollOffset={scrollLeft}
        contentLength={contentWidth}
        onScroll={setScrollLeft}
      />
    </Wrapper>
  )
})
