import useComponentSize from "@rehooks/component-size"
import { range } from "lodash"
import { observer } from "mobx-react-lite"
import React, { FC, useCallback, useEffect, useRef, useState } from "react"
import styled from "styled-components"
import { containsPoint, IPoint, zeroRect } from "../../../common/geometry"
import { bpmToUSecPerBeat, uSecPerBeatToBPM } from "../../../common/helpers/bpm"
import {
  changeTempo as _changeTempo,
  createTempo as _createTempo,
} from "../../actions"
import { Layout } from "../../Constants"
import { observeDrag2 } from "../../helpers/observeDrag"
import { useStores } from "../../hooks/useStores"
import { useTheme } from "../../hooks/useTheme"
import { LineGraphRenderer } from "../ControlPane/Graph/LineGraphRenderer"
import { GLCanvas } from "../GLCanvas/GLCanvas"
import { BAR_WIDTH, HorizontalScrollBar } from "../inputs/ScrollBar"
import CanvasPianoRuler from "../PianoRoll/CanvasPianoRuler"
import { TempoGraphAxis } from "./TempoGraphAxis"

const Wrapper = styled.div`
  position: relative;
  flex-grow: 1;
  background: var(--background-color);
  color: var(--secondary-text-color);
`

export const TempoGraph: FC = observer(() => {
  const rootStore = useStores()

  const {
    items,
    transform,
    scrollLeft: _scrollLeft,
    cursorX,
    contentWidth,
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
  const createTempo = _createTempo(rootStore)

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
    (local: IPoint) => items.find((n) => containsPoint(n.bounds, local)),
    [items]
  )

  function onMouseDownGraph(e: React.MouseEvent) {
    const local = getLocal(e.nativeEvent)
    const item = findEvent(local)
    if (!item) {
      return
    }
    const event = items.filter((ev) => ev.id === item.id)[0]
    const bpm = uSecPerBeatToBPM(event.microsecondsPerBeat)
    observeDrag2(e.nativeEvent, {
      onMouseMove: (_e, delta) => {
        const deltaBpm = transform.getDeltaBPM(delta.y)
        changeTempo(event.id, bpmToUSecPerBeat(bpm + deltaBpm))
      },
    })
  }

  function onWheelGraph(e: React.WheelEvent) {
    const local = getLocal(e.nativeEvent)
    const item = findEvent(local)
    if (!item) {
      return
    }
    const event = items.filter((ev) => ev.id === item.id)[0]
    const movement = e.nativeEvent.deltaY > 0 ? -1 : 1
    const bpm = uSecPerBeatToBPM(event.microsecondsPerBeat)
    changeTempo(event.id, bpmToUSecPerBeat(bpm + movement))
  }

  function onDoubleClickGraph(e: React.MouseEvent) {
    const local = getLocal(e.nativeEvent)
    const tick = transform.getTicks(local.x)
    const bpm = transform.getBPM(local.y)
    createTempo(tick, uSecPerBeatToBPM(bpm))
  }

  const [renderer, setRenderer] = useState<LineGraphRenderer | null>(null)

  useEffect(() => {
    if (renderer === null) {
      return
    }

    // 30 -> 510 = 17 Divided line
    const lines = range(30, transform.maxBPM, 30).map((i) => transform.getY(i))

    const selectionRect = zeroRect

    const lineWidth = 2
    const circleRadius = 4

    renderer.theme = theme

    renderer.render(
      lineWidth,
      circleRadius,
      items.map((i) => ({ ...i.bounds, id: i.id })),
      [],
      selectionRect,
      beats,
      lines,
      cursorX,
      scrollLeft
    )
  }, [items, beats, theme, scrollLeft, cursorX])

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
        onDoubleClick={onDoubleClickGraph}
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
