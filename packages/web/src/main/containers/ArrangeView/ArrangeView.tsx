import React, { Component, SFC } from "react"
import { observer, inject } from "mobx-react"
import sizeMe, { withSize } from "react-sizeme"

import PianoGrid from "containers/PianoRollEditor/PianoRoll/PianoGrid"
import PianoRuler from "containers/PianoRollEditor/PianoRoll/PianoRuler"
import PianoCursor from "containers/PianoRollEditor/PianoRoll/PianoCursor"
import PianoSelection from "containers/PianoRollEditor/PianoRoll/PianoSelection"

import Stage from "components/Stage/Stage"
import NavigationBar from "components/groups/NavigationBar"
import { VerticalScrollBar, BAR_WIDTH } from "components/inputs/ScrollBar"
import { HorizontalScaleScrollBar } from "components/inputs/ScaleScrollBar"

import { NoteCoordTransform } from "common/transform"

import mapBeats from "helpers/mapBeats"
import {
  pointSub,
  pointAdd,
  ISize,
  IPoint,
  IRect,
  containsPoint
} from "common/geometry"
import filterEventsWithScroll from "helpers/filterEventsWithScroll"

import ArrangeToolbar from "./ArrangeToolbar"
import ArrangeNoteItem from "./ArrangeNoteItem"

import Player, { LoopSetting } from "common/player/Player"

import {
  ARRANGE_START_SELECTION,
  ARRANGE_END_SELECTION,
  ARRANGE_RESIZE_SELECTION,
  ARRANGE_MOVE_SELECTION,
  ARRANGE_OPEN_CONTEXT_MENU,
  SET_PLAYER_POSITION
} from "main/actions"

import "./ArrangeView.css"
import Track, { TrackEvent, isNoteEvent } from "common/track"
import Theme from "common/theme"
import { Beat } from "common/measure"
import RootStore from "src/main/stores/RootStore"
import { NotePoint } from "common/transform/NotePoint"
import { compose } from "recompose"

interface NavItemProps {
  title: string
  onClick: () => void
}

function NavItem({ title, onClick }: NavItemProps) {
  return (
    <div className="NavItem" onClick={onClick}>
      {title}
    </div>
  )
}

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
  scrollLeft
}: ArrangeTrackProps) {
  const t = transform
  const items = events
    .filter(isNoteEvent)
    .map(e => new ArrangeNoteItem(e.id, t.getRect(e), isDrumMode))

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

interface ArrangeViewProps {
  tracks: Track[]
  theme: Theme
  beats: Beat[]
  endTick: number
  playerPosition: number
  setPlayerPosition: (position: number) => void
  transform: NoteCoordTransform
  selection: IRect
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
  pushSettings: () => void
  onClickScaleUp: () => void
  onClickScaleDown: () => void
  onClickScaleReset: () => void
  openContextMenu: (x: number, y: number, isSelectionSelected: boolean) => void
}

const ArrangeView: SFC<ArrangeViewProps> = ({
  tracks,
  theme,
  beats,
  endTick,
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
  pushSettings,
  onClickScaleUp,
  onClickScaleDown,
  onClickScaleReset,
  openContextMenu
}) => {
  scrollLeft = Math.floor(scrollLeft)

  const { pixelsPerTick } = transform

  const containerWidth = size.width
  const containerHeight = size.height

  const startTick = scrollLeft / pixelsPerTick
  const widthTick = Math.max(endTick, transform.getTicks(containerWidth))
  const contentWidth = widthTick * pixelsPerTick
  const mappedBeats = mapBeats(beats, pixelsPerTick, startTick, widthTick)

  const bottomBorderWidth = 1
  const trackHeight =
    Math.ceil(transform.pixelsPerKey * transform.numberOfKeys) +
    bottomBorderWidth
  const contentHeight = trackHeight * tracks.length

  const selectionRect = selection && {
    x: transform.getX(selection.x) - scrollLeft,
    width: transform.getX(selection.width),
    y: selection.y * trackHeight - scrollTop,
    height: selection.height * trackHeight
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
      mouseMove(e => {
        resizeSelection(startPos, createPoint(e))
      })
      mouseUp(e => {
        endSelection(startPos, createPoint(e))
      })
    }

    const dragSelectionHandler = (
      e: MouseEvent,
      mouseMove: (handler: (e: MouseEvent) => void) => void,
      mouseUp: (handler: (e: MouseEvent) => void) => void
    ) => {
      const startSelection = { ...selection }
      mouseMove(e => {
        const delta = pointSub(createPoint(e), startPos)
        const pos = pointAdd(startSelection, delta)
        moveSelection(pos)
      })
      mouseUp(e => {})
    }

    let handler

    if (isSelectionSelected) {
      handler = dragSelectionHandler
    } else {
      handler = createSelectionHandler
    }

    let mouseMove: (e: MouseEvent) => void
    let mouseUp: (e: MouseEvent) => void
    handler(e.nativeEvent, fn => (mouseMove = fn), fn => (mouseUp = fn))

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
    openContextMenu(e.pageX, e.pageY, isSelectionSelected)
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
      <NavigationBar>
        <ArrangeToolbar />
        <div className="menu">
          <NavItem title="settings" onClick={pushSettings} />
        </div>
      </NavigationBar>
      <div className="alpha">
        <div
          className="right"
          onMouseDown={onMouseDown}
          onContextMenu={e => e.preventDefault()}
          onWheel={onWheel}
        >
          <PianoRuler
            width={containerWidth}
            theme={theme}
            height={theme.rulerHeight}
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
            <PianoGrid
              theme={theme}
              width={containerWidth}
              height={contentHeight}
              scrollLeft={scrollLeft}
              beats={mappedBeats}
            />
            <PianoSelection
              width={containerWidth}
              height={contentHeight}
              color="black"
              selectionBounds={selectionRect}
            />
            <PianoCursor
              width={containerWidth}
              height={contentHeight}
              position={transform.getX(playerPosition) - scrollLeft}
            />
          </div>
          <div
            style={{
              width: `calc(100% - ${BAR_WIDTH}px)`,
              position: "absolute",
              bottom: 0
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
            right: 0
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
    </div>
  )
}

interface Props {
  player: Player
  pixelsPerTick: number
  keyHeight: number
  autoScroll: boolean
  size: ISize
  scrollLeft: number
  setScrollLeft: (scroll: number) => void
  setScrollTop: (scroll: number) => void
}

function stateful(WrappedComponent: any) {
  return class extends Component<Props> {
    componentDidMount() {
      this.props.player.on("change-position", this.updatePosition)
    }

    componentWillUnmount() {
      this.props.player.off("change-position", this.updatePosition)
    }

    get transform() {
      return new NoteCoordTransform(
        this.props.pixelsPerTick,
        this.props.keyHeight,
        127
      )
    }

    updatePosition = (tick: number) => {
      this.setState({
        playerPosition: tick
      })

      const { autoScroll, size } = this.props

      // keep scroll position to cursor
      if (autoScroll) {
        const transform = this.transform
        const x = transform.getX(tick)
        const screenX = x - this.props.scrollLeft
        if (screenX > size.width * 0.7 || screenX < 0) {
          this.props.setScrollLeft(x)
        }
      }
    }

    render() {
      const { setScrollLeft, setScrollTop } = this.props

      return (
        <WrappedComponent
          onScrollLeft={(scroll: number) => setScrollLeft(scroll)}
          onScrollTop={(scroll: number) => setScrollTop(scroll)}
          transform={this.transform}
          {...this.state}
          {...this.props}
        />
      )
    }
  }
}

const mapStoreToProps = ({
  rootStore: {
    rootViewStore: { theme },
    song: { tracks, measureList, endOfSong },
    arrangeViewStore: s,
    services: { player, quantizer },
    playerStore: { loop },
    router,
    dispatch
  }
}: {
  rootStore: RootStore
}) => ({
  theme,
  player,
  quantizer,
  loop,
  tracks: (tracks as any).toJS(),
  beats: measureList.beats,
  endTick: endOfSong,
  keyHeight: 0.3,
  pixelsPerTick: 0.1 * s.scaleX,
  autoScroll: s.autoScroll,
  scrollLeft: s.scrollLeft,
  scrollTop: s.scrollTop,
  selection: s.selection,
  setScrollLeft: (v: number) => (s.scrollLeft = v),
  setScrollTop: (v: number) => (s.scrollTop = v),
  pushSettings: () => router.pushSettings(),
  onClickScaleUp: () => (s.scaleX = s.scaleX + 0.1),
  onClickScaleDown: () => (s.scaleX = Math.max(0.05, s.scaleX - 0.1)),
  onClickScaleReset: () => (s.scaleX = 1),
  setPlayerPosition: (tick: number) => dispatch(SET_PLAYER_POSITION, tick),
  startSelection: (pos: IPoint) => dispatch(ARRANGE_START_SELECTION, pos),
  endSelection: (start: IPoint, end: IPoint) =>
    dispatch(ARRANGE_END_SELECTION, { start, end }),
  resizeSelection: (start: NotePoint, end: NotePoint) =>
    dispatch(ARRANGE_RESIZE_SELECTION, { start, end }),
  moveSelection: (pos: IPoint) => dispatch(ARRANGE_MOVE_SELECTION, pos),
  openContextMenu: (x: number, y: number, isSelectionSelected: boolean) =>
    dispatch(ARRANGE_OPEN_CONTEXT_MENU, {
      position: { x, y },
      isSelectionSelected
    })
})

export default compose(
  withSize(),
  inject(mapStoreToProps),
  observer,
  stateful
)(ArrangeView)
