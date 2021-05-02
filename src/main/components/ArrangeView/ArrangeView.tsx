import useComponentSize from "@rehooks/component-size"
import { partition } from "lodash"
import cloneDeep from "lodash/cloneDeep"
import { toJS } from "mobx"
import { observer } from "mobx-react-lite"
import React, { FC, useCallback, useEffect, useRef, useState } from "react"
import styled from "styled-components"
import {
  containsPoint,
  IPoint,
  moveRect,
  pointAdd,
  pointSub,
} from "../../../common/geometry"
import { filterEventsWithScroll } from "../../../common/helpers/filterEventsWithScroll"
import { createBeatsInRange } from "../../../common/helpers/mapBeats"
import { isNoteEvent } from "../../../common/track"
import { NoteCoordTransform } from "../../../common/transform"
import {
  arrangeEndSelection,
  arrangeMoveSelection,
  arrangeResizeSelection,
  arrangeStartSelection,
} from "../../actions"
import { Layout } from "../../Constants"
import { useContextMenu } from "../../hooks/useContextMenu"
import { useStores } from "../../hooks/useStores"
import { useTheme } from "../../hooks/useTheme"
import { GLCanvas } from "../GLCanvas/GLCanvas"
import { HorizontalScaleScrollBar } from "../inputs/ScaleScrollBar"
import { BAR_WIDTH, VerticalScrollBar } from "../inputs/ScrollBar"
import CanvasPianoRuler from "../PianoRoll/CanvasPianoRuler"
import { observeDrag } from "../PianoRoll/MouseHandler/observeDrag"
import { ArrangeContextMenu } from "./ArrangeContextMenu"
import { ArrangeViewRenderer } from "./ArrangeViewRenderer"

const Wrapper = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: row;
  position: relative;
  background: var(--background-color);
`

export const ArrangeView: FC = observer(() => {
  const rootStore = useStores()

  const autoScroll = rootStore.arrangeViewStore.autoScroll
  const playerPosition = rootStore.services.player.position
  const pixelsPerTick = Layout.pixelsPerTick * rootStore.arrangeViewStore.scaleX
  const isPlaying = rootStore.services.player.isPlaying
  const tracks = toJS(rootStore.song.tracks)
  const measures = rootStore.song.measures
  const timebase = rootStore.services.player.timebase
  const trackEndTick = rootStore.song.endOfSong
  const selection = rootStore.arrangeViewStore.selection

  const { arrangeViewStore: s } = rootStore

  const ref = useRef(null)
  const size = useComponentSize(ref)

  const keyHeight = 0.3

  const [_scrollLeft, _setScrollLeft] = useState(0)
  const [scrollTop, _setScrollTop] = useState(0)

  const transform = new NoteCoordTransform(pixelsPerTick, keyHeight, 127)

  useEffect(() => {
    // keep scroll position to cursor
    if (autoScroll && isPlaying) {
      const x = transform.getX(playerPosition)
      const screenX = x - _scrollLeft
      if (screenX > size.width * 0.7 || screenX < 0) {
        setScrollLeft(x)
      }
    }
  }, [
    autoScroll,
    isPlaying,
    _scrollLeft,
    playerPosition,
    pixelsPerTick,
    size.width,
  ])

  const theme = useTheme()

  const onClickScaleUp = () => (s.scaleX = s.scaleX + 0.1)
  const onClickScaleDown = () => (s.scaleX = Math.max(0.05, s.scaleX - 0.1))
  const onClickScaleReset = () => (s.scaleX = 1)
  const startSelection = (pos: IPoint) => arrangeStartSelection(rootStore)(pos)
  const endSelection = (start: IPoint, end: IPoint) =>
    arrangeEndSelection(rootStore)(start, end)
  const resizeSelection = (start: IPoint, end: IPoint) =>
    arrangeResizeSelection(rootStore)(start, end)

  const moveSelection = (pos: IPoint) => arrangeMoveSelection(rootStore)(pos)

  const scrollLeft = Math.floor(_scrollLeft)

  const containerWidth = size.width
  const containerHeight = size.height

  const startTick = scrollLeft / pixelsPerTick
  const widthTick = transform.getTicks(containerWidth)
  const endTick = startTick + widthTick
  const contentWidth = Math.max(trackEndTick, endTick) * pixelsPerTick
  const mappedBeats = createBeatsInRange(
    measures,
    pixelsPerTick,
    timebase,
    startTick,
    containerWidth
  )

  const bottomBorderWidth = 1
  const trackHeight =
    Math.ceil(transform.pixelsPerKey * transform.numberOfKeys) +
    bottomBorderWidth
  const contentHeight = trackHeight * tracks.length

  const selectionRect = selection && {
    x: transform.getX(selection.x) - scrollLeft,
    width: transform.getX(selection.width),
    y: selection.y * trackHeight - scrollTop,
    height: selection.height * trackHeight,
  }

  function setScrollLeft(scroll: number) {
    const maxOffset = Math.max(0, contentWidth - containerWidth)
    _setScrollLeft(Math.floor(Math.min(maxOffset, Math.max(0, scroll))))
  }

  function setScrollTop(scroll: number) {
    const maxOffset = Math.max(0, contentHeight - containerHeight)
    _setScrollTop(Math.floor(Math.min(maxOffset, Math.max(0, scroll))))
  }

  const [isSelectionSelected, setSelectionSelected] = useState(false)

  function handleLeftClick(
    e: React.MouseEvent,
    createPoint: (e: MouseEvent) => IPoint
  ) {
    const startPos = createPoint(e.nativeEvent)
    const isSelectionSelected =
      selection != null && containsPoint(selection, startPos)

    // save state to pass to ArrangeContextMenu
    setSelectionSelected(isSelectionSelected)

    const createSelectionHandler = (
      e: MouseEvent,
      mouseMove: (handler: (e: MouseEvent) => void) => void,
      mouseUp: (handler: (e: MouseEvent) => void) => void
    ) => {
      startSelection(startPos)
      mouseMove((e) => {
        resizeSelection(startPos, createPoint(e))
      })
      mouseUp((e) => {
        endSelection(startPos, createPoint(e))
      })
    }

    const dragSelectionHandler = (
      e: MouseEvent,
      mouseMove: (handler: (e: MouseEvent) => void) => void,
      mouseUp: (handler: (e: MouseEvent) => void) => void
    ) => {
      if (selection === null) {
        return
      }
      const startSelection = cloneDeep(selection)
      mouseMove((e) => {
        const delta = pointSub(createPoint(e), startPos)
        const pos = pointAdd(startSelection, delta)
        moveSelection(pos)
      })
      mouseUp((e) => {})
    }

    let handler

    if (isSelectionSelected) {
      handler = dragSelectionHandler
    } else {
      handler = createSelectionHandler
    }

    let mouseMove: (e: MouseEvent) => void
    let mouseUp: (e: MouseEvent) => void
    handler(
      e.nativeEvent,
      (fn) => (mouseMove = fn),
      (fn) => (mouseUp = fn)
    )

    observeDrag({
      onMouseMove: (e) => mouseMove(e),
      onMouseUp: (e) => mouseUp(e),
    })
  }

  function handleMiddleClick(e: React.MouseEvent) {
    function createPoint(e: MouseEvent) {
      return { x: e.clientX, y: e.clientY }
    }
    const startPos = createPoint(e.nativeEvent)

    observeDrag({
      onMouseMove(e) {
        const pos = createPoint(e)
        const delta = pointSub(pos, startPos)
        setScrollLeft(Math.max(0, scrollLeft - delta.x))
        setScrollTop(Math.max(0, scrollTop - delta.y))
      },
    })
  }

  const { onContextMenu, menuProps } = useContextMenu()

  function onMouseDown(e: React.MouseEvent) {
    const { left, top } = e.currentTarget.getBoundingClientRect()

    function createPoint(e: MouseEvent) {
      const x = e.pageX - left + scrollLeft
      const y = e.pageY - top - Layout.rulerHeight + scrollTop
      const tick = transform.getTicks(x)
      return { x: tick, y: y / trackHeight }
    }

    switch (e.button) {
      case 0:
        handleLeftClick(e, createPoint)
        break
      case 1:
        handleMiddleClick(e)
        break
      case 2:
        onContextMenu(e)
        break
      default:
        break
    }
  }

  function onWheel(e: React.WheelEvent) {
    const scrollLineHeight = trackHeight
    const delta = scrollLineHeight * (e.deltaY > 0 ? 1 : -1)
    setScrollTop(scrollTop + delta)
  }

  const [renderer, setRenderer] = useState<ArrangeViewRenderer | null>(null)

  useEffect(() => {
    if (renderer === null) {
      return
    }
    const trackHeight = Math.ceil(
      transform.pixelsPerKey * transform.numberOfKeys
    )

    const rects = tracks
      .map((t, i) =>
        filterEventsWithScroll(
          t.events,
          pixelsPerTick,
          scrollLeft,
          containerWidth
        )
          .filter(isNoteEvent)
          .map((e) =>
            moveRect(transform.getRect(e), { x: 0, y: trackHeight * i })
          )
      )
      .flat()

    const cursorX = transform.getX(playerPosition) - scrollLeft

    const [highlightedBeats, nonHighlightedBeats] = partition(
      mappedBeats,
      (b) => b.beat === 0
    )

    renderer.theme = theme
    renderer.render(
      cursorX,
      rects,
      nonHighlightedBeats.map((b) => b.x),
      highlightedBeats.map((b) => b.x),
      { x: scrollLeft, y: scrollTop }
    )
  }, [renderer, tracks, scrollLeft, scrollTop])

  return (
    <Wrapper ref={ref}>
      <div
        className="right"
        onMouseDown={onMouseDown}
        onContextMenu={(e) => e.preventDefault()}
        onWheel={onWheel}
      >
        <CanvasPianoRuler
          width={containerWidth}
          beats={mappedBeats}
          scrollLeft={scrollLeft}
          pixelsPerTick={pixelsPerTick}
        />
        <GLCanvas
          onCreateContext={useCallback(
            (gl) => setRenderer(new ArrangeViewRenderer(gl)),
            []
          )}
          width={containerWidth}
          height={contentHeight}
        />
        <div
          style={{
            width: `calc(100% - ${BAR_WIDTH}px)`,
            position: "absolute",
            bottom: 0,
          }}
        >
          <HorizontalScaleScrollBar
            scrollOffset={scrollLeft}
            contentLength={contentWidth}
            onScroll={_setScrollLeft}
            onClickScaleUp={onClickScaleUp}
            onClickScaleDown={onClickScaleDown}
            onClickScaleReset={onClickScaleReset}
          />
        </div>
      </div>
      <div
        style={{
          height: `calc(100% - ${BAR_WIDTH}px)`,
          position: "absolute",
          top: 0,
          right: 0,
        }}
      >
        <VerticalScrollBar
          scrollOffset={scrollTop}
          contentLength={contentHeight}
          onScroll={_setScrollTop}
        />
      </div>
      <div className="scroll-corner" />
      <ArrangeContextMenu
        {...menuProps}
        isSelectionSelected={isSelectionSelected}
      />
    </Wrapper>
  )
})
