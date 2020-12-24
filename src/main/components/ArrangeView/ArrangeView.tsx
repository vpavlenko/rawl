import { Container } from "@inlet/react-pixi"
import cloneDeep from "lodash/cloneDeep"
import React, { RefObject } from "react"
import styled from "styled-components"
import {
  containsPoint,
  IPoint,
  IRect,
  ISize,
  pointAdd,
  pointSub,
} from "../../../common/geometry"
import { filterEventsWithScroll } from "../../../common/helpers/filterEventsWithScroll"
import { createBeatsInRange } from "../../../common/helpers/mapBeats"
import { Measure } from "../../../common/measure/Measure"
import { Theme } from "../../../common/theme/Theme"
import Track, { isNoteEvent, TrackEvent } from "../../../common/track"
import { NoteCoordTransform } from "../../../common/transform"
import ArrangeNoteItem from "../../components/ArrangeView/ArrangeNoteItem"
import { HorizontalScaleScrollBar } from "../inputs/ScaleScrollBar"
import { BAR_WIDTH, VerticalScrollBar } from "../inputs/ScrollBar"
import { observeDrag } from "../PianoRoll/MouseHandler/observeDrag"
import PianoCursor from "../PianoRoll/PianoCursor"
import PianoGrid from "../PianoRoll/PianoGrid"
import PianoRuler from "../PianoRoll/PianoRuler"
import PianoSelection from "../PianoRoll/PianoSelection"
import Stage from "../Stage/Stage"

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

const Wrapper = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: row;
  position: relative;
  background: var(--secondary-background-color);

  .ArrangeTrack {
    background: var(--background-color);
    border-bottom: 1px solid var(--divider-color);
  }

  .tracks,
  .PianoGrid,
  .PianoRuler,
  .PianoCursor,
  .PianoSelection {
    position: absolute;
    top: 0;
    left: 0;
  }

  .PianoRuler {
    z-index: 9;
  }

  .ScrollBar {
    z-index: 100;
  }

  .scroll-corner {
    position: absolute;
    bottom: 0;
    right: 0;
    height: 17px;
    width: 17px;
    background: var(--secondary-background-color);
  }

  .right {
    position: relative;
    flex-grow: 1;
  }

  .right > .content {
    position: absolute;
    margin-top: var(--ruler-height);
    width: 100%;
    height: 100%;
  }

  .headers {
    position: absolute;
    margin-top: var(--ruler-height);
    width: 100%;
  }

  .TrackHeader {
    padding: 0.2em 1em;
    box-sizing: border-box;
    border-bottom: 1px solid var(--divider-color);
    background: var(--background-color);
    position: relative;
  }

  .TrackHeader:hover {
    background: var(--secondary-background-color);
  }

  .TrackHeader .name {
    font-weight: bold;
    font-size: 110%;
  }

  .TrackHeader .instrument {
    font-size: 90%;
    color: var(--secondary-text-color);
  }

  .left-top-space {
    height: var(--ruler-height);
    border-bottom: 1px solid var(--divider-color);
    background: var(--background-color);
    position: absolute;
    top: 0;
    z-index: 11;
    left: 0;
    width: 100%;
  }

  .NavigationBar {
    border-bottom: 1px solid var(--divider-color);
  }

  .NavigationBar .menu {
    display: flex;
    flex-grow: 1;
    -webkit-app-region: drag;
  }

  .NavigationBar .NavItem {
    display: flex;
    align-items: center;
    margin-left: auto;
    padding: 1em;
    text-transform: uppercase;
    font-size: 90%;
  }

  .NavigationBar .NavItem:hover {
    opacity: 0.5;
  }

  .AddTrackButton {
    padding: 0.5em 0.75em;
    border-top: 1px solid var(--divider-color);
    border-bottom: 1px solid var(--divider-color);
    position: absolute;
    bottom: 0;
    width: 100%;
    box-sizing: border-box;
    background: var(--background-color);
  }

  .AddTrackButton:hover {
    background: var(--secondary-background-color);
  }

  .AddTrackButton .Icon {
    margin-right: 0.5em;
  }

  .TrackHeader .mark {
    position: absolute;
    right: 1em;
    top: 0.8em;
    background: var(--secondary-background-color);
    border-radius: 100px;
    width: 1.25em;
    height: 1.25em;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--secondary-text-color);
    font-size: 110%;
  }
`

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
  onClickScaleUp: () => void
  onClickScaleDown: () => void
  onClickScaleReset: () => void
  openContextMenu: (e: React.MouseEvent, isSelectionSelected: boolean) => void
}

const _ArrangeView = (
  {
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
    onClickScaleUp,
    onClickScaleDown,
    onClickScaleReset,
    openContextMenu,
  }: ArrangeViewProps,
  ref: RefObject<HTMLDivElement>
) => {
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
    <Wrapper ref={ref}>
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
        />
        <div className="content" style={{ top: -scrollTop }}>
          <div className="tracks">
            {tracks.map((t, i) => (
              <ArrangeTrack
                width={containerWidth}
                events={filterEventsWithScroll(
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
          {selectionRect && (
            <PianoSelection bounds={selectionRect} onRightClick={() => {}} />
          )}
          <Container x={transform.getX(playerPosition) - scrollLeft}>
            <PianoCursor height={contentHeight} />
          </Container>
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
    </Wrapper>
  )
}

export const ArrangeView = React.forwardRef<HTMLDivElement, ArrangeViewProps>(
  _ArrangeView
)
