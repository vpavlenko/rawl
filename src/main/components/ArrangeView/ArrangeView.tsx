import React, { SFC } from "react"

import PianoGrid from "components/PianoRoll/PianoGrid"
import PianoRuler from "components/PianoRoll/PianoRuler"
import PianoCursor from "components/PianoRoll/PianoCursor"
import PianoSelection from "components/PianoRoll/PianoSelection"

import Stage from "components/Stage/Stage"
import { VerticalScrollBar, BAR_WIDTH } from "components/inputs/ScrollBar"
import { HorizontalScaleScrollBar } from "components/inputs/ScaleScrollBar"

import { NoteCoordTransform } from "common/transform"

import { createBeatsInRange } from "helpers/mapBeats"
import {
  pointSub,
  pointAdd,
  ISize,
  IPoint,
  IRect,
  containsPoint,
} from "common/geometry"
import filterNoteEventsWithScroll from "helpers/filterEventsWithScroll"

import ArrangeNoteItem from "../../components/ArrangeView/ArrangeNoteItem"

import { LoopSetting } from "common/player/Player"

import "./ArrangeView.css"
import Track, { TrackEvent, isNoteEvent } from "common/track"
import Theme from "common/theme"
import Measure from "common/measure"

interface ArrangeTrackProps {
  events: TrackEvent[]
  transform: NoteCoordTransform
  width: number
  isDrumMode: boolean
  scrollLeft: number
}

function ArrangeTrack({
  events,
  transform,
  width,
  isDrumMode,
  scrollLeft,
}: ArrangeTrackProps) {
  const t = transform
  const items = events
    .filter(isNoteEvent)
    .map((e) => new ArrangeNoteItem(e.id, t.getRect(e), isDrumMode))

  return (
    <Stage
      className="ArrangeTrack"
      items={items}
      width={width}
      height={Math.ceil(t.pixelsPerKey * t.numberOfKeys)}
      scrollLeft={scrollLeft}
    />
  )
}

export interface ArrangeViewProps {
  tracks: Track[]
  theme: Theme
  measures: Measure[]
  timebase: number
  endTick: number
  playerPosition: number
  setPlayerPosition: (position: number) => void
  transform: NoteCoordTransform
  selection: IRect | null
  startSelection: (position: IPoint) => void
  resizeSelection: (start: IPoint, end: IPoint) => void
  endSelection: (start: IPoint, end: IPoint) => void
  moveSelection: (position: IPoint) => void
  autoScroll: boolean
  scrollLeft: number
  scrollTop: number
  onScrollLeft: (scroll: number) => void
  onScrollTop: (scroll: number) => void
  size: ISize
  loop: LoopSetting
  onClickScaleUp: () => void
  onClickScaleDown: () => void
  onClickScaleReset: () => void
  openContextMenu: (e: React.MouseEvent, isSelectionSelected: boolean) => void
}

export const ArrangeView: SFC<ArrangeViewProps> = ({
  tracks,
  theme,
  measures,
  timebase,
  endTick: trackEndTick,
  playerPosition,
  setPlayerPosition,
  transform,
  selection,
  startSelection,
  resizeSelection,
  endSelection,
  moveSelection,
  autoScroll,
  scrollLeft = 0,
  scrollTop = 0,
  onScrollLeft,
  onScrollTop,
  size,
  loop,
  onClickScaleUp,
  onClickScaleDown,
  onClickScaleReset,
  openContextMenu,
}) => {
  scrollLeft = Math.floor(scrollLeft)

  const { pixelsPerTick } = transform

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
    endTick
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
    onScrollLeft(Math.floor(Math.min(maxOffset, Math.max(0, scroll))))
  }

  function setScrollTop(scroll: number) {
    const maxOffset = Math.max(0, contentHeight - containerHeight)
    onScrollTop(Math.floor(Math.min(maxOffset, Math.max(0, scroll))))
  }

  function handleLeftClick(
    e: React.MouseEvent,
    createPoint: (e: MouseEvent) => IPoint
  ) {
    const startPos = createPoint(e.nativeEvent)
    const isSelectionSelected =
      selection != null && containsPoint(selection, startPos)

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
      const startSelection = { ...selection }
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

    function onMouseMove(e: MouseEvent) {
      mouseMove(e)
    }

    function onMouseUp(e: MouseEvent) {
      mouseUp(e)
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
    }

    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
  }

  function handleMiddleClick(e: React.MouseEvent) {
    function createPoint(e: MouseEvent) {
      return { x: e.clientX, y: e.clientY }
    }
    const startPos = createPoint(e.nativeEvent)

    function onMouseMove(e: MouseEvent) {
      const pos = createPoint(e)
      const delta = pointSub(pos, startPos)
      setScrollLeft(Math.max(0, scrollLeft - delta.x))
      setScrollTop(Math.max(0, scrollTop - delta.y))
    }

    function onMouseUp(e: MouseEvent) {
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
    }

    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
  }

  function handleRightClick(
    e: React.MouseEvent,
    createPoint: (e: MouseEvent) => IPoint
  ) {
    const startPos = createPoint(e.nativeEvent)
    const isSelectionSelected =
      selection != null && containsPoint(selection, startPos)
    openContextMenu(e, isSelectionSelected)
  }

  function onMouseDown(e: React.MouseEvent) {
    const { left, top } = e.currentTarget.getBoundingClientRect()

    function createPoint(e: MouseEvent) {
      const x = e.pageX - left + scrollLeft
      const y = e.pageY - top - theme.rulerHeight + scrollTop
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
        handleRightClick(e, createPoint)
        break
      default:
        break
    }
  }

  function onWheel(e: React.WheelEvent) {
    e.preventDefault()
    const scrollLineHeight = trackHeight
    const delta = scrollLineHeight * (e.deltaY > 0 ? 1 : -1)
    setScrollTop(scrollTop + delta)
  }

  return (
    <div className="ArrangeView">
      <div
        className="right"
        onMouseDown={onMouseDown}
        onContextMenu={(e) => e.preventDefault()}
        onWheel={onWheel}
      >
        <PianoRuler
          width={containerWidth}
          beats={mappedBeats}
          scrollLeft={scrollLeft}
          pixelsPerTick={pixelsPerTick}
          onMouseDown={({ tick }) => setPlayerPosition(tick)}
          loop={loop}
        />
        <div className="content" style={{ top: -scrollTop }}>
          <div className="tracks">
            {tracks.map((t, i) => (
              <ArrangeTrack
                width={containerWidth}
                events={filterNoteEventsWithScroll(
                  t.events,
                  pixelsPerTick,
                  scrollLeft,
                  containerWidth
                )}
                transform={transform}
                key={i}
                scrollLeft={scrollLeft}
                isDrumMode={t.isRhythmTrack}
              />
            ))}
          </div>
          <PianoGrid height={contentHeight} beats={mappedBeats} />
          <PianoSelection selectionBounds={selectionRect} />
          <PianoCursor
            height={contentHeight}
            position={transform.getX(playerPosition) - scrollLeft}
          />
        </div>
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
            onScroll={onScrollLeft}
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
          onScroll={onScrollTop}
        />
      </div>
      <div className="scroll-corner" />
    </div>
  )
}
