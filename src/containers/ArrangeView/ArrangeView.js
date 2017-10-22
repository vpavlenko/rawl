import React, { Component } from "react"
import { observer, inject } from "mobx-react"

import PianoGrid from "../PianoRoll/PianoGrid"
import PianoRuler from "../PianoRoll/PianoRuler"
import PianoCursor from "../PianoRoll/PianoCursor"
import PianoSelection from "../PianoRoll/PianoSelection"

import DrawCanvas from "components/DrawCanvas"
import { VerticalScrollBar, HorizontalScrollBar, BAR_WIDTH } from "components/inputs/ScrollBar"

import Rect from "model/Rect"
import NoteCoordTransform from "model/NoteCoordTransform"

import mapBeats from "helpers/mapBeats"
import { pointSub } from "helpers/point"
import filterEventsWithScroll from "helpers/filterEventsWithScroll"
import fitToContainer from "hocs/fitToContainer"

import "./ArrangeView.css"

function drawNote(ctx, rect) {
  const { x, y, width } = rect

  ctx.beginPath()
  ctx.strokeStyle = "blue"
  ctx.lineWidth = 1
  ctx.moveTo(Math.round(x), Math.round(y))
  ctx.lineTo(Math.round(x + width), Math.round(y))
  ctx.stroke()
}

function drawDrumNote(ctx, rect) {
  const { x, y } = rect

  ctx.beginPath()
  ctx.strokeStyle = "blue"
  ctx.lineWidth = 2
  ctx.moveTo(Math.round(x), Math.round(y))
  ctx.lineTo(Math.round(x + 2), Math.round(y))
  ctx.stroke()
}

function ArrangeTrack({
  events,
  transform,
  width,
  isDrumMode,
  scrollLeft
}) {
  const t = transform
  const noteRects = events
    .filter(e => e.subtype === "note")
    .map(e => t.getRect(e))

  function draw(ctx) {
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)

    ctx.save()
    ctx.translate(0.5 - Math.round(scrollLeft), 0.5)
    const draw = isDrumMode ? drawDrumNote : drawNote
    noteRects.forEach(rect => draw(ctx, rect))
    ctx.restore()
  }

  return <DrawCanvas
    draw={draw}
    className="ArrangeTrack"
    width={width}
    height={Math.ceil(t.pixelsPerKey * t.numberOfKeys)}
  />
}

function ArrangeView({
  tracks,
  theme,
  containerWidth,
  containerHeight,
  beats,
  endTick,
  playerPosition,
  transform,
  selection,
  startSelection,
  resizeSelection,
  endSelection,
  scrollLeft = 0,
  scrollTop = 0,
  onScrollLeft,
  onScrollTop,
  dispatch
}) {
  scrollLeft = Math.floor(scrollLeft)

  const { pixelsPerTick } = transform

  const startTick = scrollLeft / pixelsPerTick
  const widthTick = Math.max(endTick, transform.getTicks(containerWidth))
  const contentWidth = widthTick * pixelsPerTick
  const mappedBeats = mapBeats(beats, pixelsPerTick, startTick, widthTick)

  const bottomBorderWidth = 1
  const trackHeight = Math.ceil(transform.pixelsPerKey * transform.numberOfKeys) + bottomBorderWidth
  const contentHeight = trackHeight * tracks.length

  const selectionRect = selection && {
    x: transform.getX(selection.x) - scrollLeft,
    width: transform.getX(selection.width),
    y: selection.y * trackHeight - scrollTop,
    height: selection.height * trackHeight
  }

  function setScrollLeft(scroll) {
    const maxOffset = Math.max(0, contentWidth - containerWidth)
    onScrollLeft({ scroll: Math.floor(Math.min(maxOffset, Math.max(0, scroll))) })
  }

  function setScrollTop(scroll) {
    const maxOffset = Math.max(0, contentHeight - containerHeight)
    onScrollTop({ scroll: Math.floor(Math.min(maxOffset, Math.max(0, scroll))) })
  }

  function handleLeftClick(e) {
    function createPoint(x, y) {
      const tick = transform.getTicks(x + scrollLeft)
      if (y <= theme.rulerHeight) {
        return { x: tick, y: -1 }
      }
      return { x: tick, y: (y - theme.rulerHeight + scrollTop) / trackHeight }
    }

    const { left, top } = e.target.getBoundingClientRect()
    const startPos = createPoint(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
    startSelection(startPos)

    function onMouseMove(e) {
      resizeSelection(startPos, createPoint(e.clientX - left, e.clientY - top))
    }

    function onMouseUp(e) {
      endSelection(startPos, createPoint(e.clientX - left, e.clientY - top))
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
    }

    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
  }

  function handleMiddleClick(e) {
    function createPoint(e) {
      return { x: e.clientX, y: e.clientY }
    }
    const startPos = createPoint(e.nativeEvent)

    function onMouseMove(e) {
      const pos = createPoint(e)
      const delta = pointSub(pos, startPos)
      setScrollLeft(Math.max(0, scrollLeft - delta.x))
      setScrollTop(Math.max(0, scrollTop - delta.y))
    }

    function onMouseUp(e) {
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
    }

    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
  }

  function onMouseDown(e) {
    switch (e.button) {
      case 0:
        handleLeftClick(e)
        break
      case 1:
        handleMiddleClick(e)
        break
      default:
        break
    }
  }

  function onWheel(e) {
    e.preventDefault()
    const scrollLineHeight = trackHeight
    const delta = scrollLineHeight * (e.deltaY > 0 ? 1 : -1)
    setScrollTop(scrollTop + delta)
  }

  return <div
    className="ArrangeView"
    onMouseDown={onMouseDown}
    onWheel={onWheel}
  >
    <PianoRuler
      width={containerWidth}
      theme={theme}
      height={theme.rulerHeight}
      endTick={widthTick}
      beats={mappedBeats}
      scrollLeft={scrollLeft}
      pixelsPerTick={pixelsPerTick}
      onMouseDown={({ tick }) => dispatch("SET_PLAYER_POSITION", { tick })}
    />
    <div className="content">
      <div className="tracks" style={{ top: -scrollTop }}>
        {tracks.map((t, i) =>
          <ArrangeTrack
            width={containerWidth}
            events={filterEventsWithScroll(t.events, pixelsPerTick, scrollLeft, containerWidth)}
            transform={transform}
            key={i}
            scrollLeft={scrollLeft}
            isDrumMode={t.isRhythmTrack}
          />
        )}
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
        hidden={selection == null}
      />
    </div>
    <PianoCursor
      width={containerWidth}
      height={containerHeight}
      position={transform.getX(playerPosition) - scrollLeft}
    />
    <div style={{ height: `calc(100% - ${BAR_WIDTH}px)`, position: "relative" }}>
      <VerticalScrollBar
        scrollOffset={scrollTop}
        contentLength={contentHeight}
        onScroll={onScrollTop}
      />
    </div>
    <div style={{ width: `calc(100% - ${BAR_WIDTH}px)`, position: "absolute", bottom: 0 }}>
      <HorizontalScrollBar
        scrollOffset={scrollLeft}
        contentLength={contentWidth}
        onScroll={onScrollLeft}
      />
    </div>
    <div className="scroll-corner" />
  </div>
}

function stateful(WrappedComponent) {
  return class extends Component {
    constructor(props) {
      super(props)

      this.state = {
        scrollLeft: 0,
        selection: null  // Rect を使うが、x は tick, y はトラック番号を表す
      }
    }

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
        127)
    }

    updatePosition = (tick) => {
      this.setState({
        playerPosition: tick
      })

      const { autoScroll, containerWidth } = this.props

      // keep scroll position to cursor
      if (autoScroll) {
        const transform = this.transform
        const x = transform.getX(tick)
        const screenX = x - this.state.scrollLeft
        if (screenX > containerWidth * 0.7 || screenX < 0) {
          this.setState({
            scrollLeft: x
          })
        }
      }
    }

    render() {
      const onScrollLeft = ({ scroll }) => {
        this.setState({
          scrollLeft: scroll
        })
      }

      const onScrollTop = ({ scroll }) => {
        this.setState({
          scrollTop: scroll
        })
      }

      const createRect = (from, to) => {
        const rect = Rect.fromPoints(from, to)
        rect.y = Math.floor(rect.y)
        rect.height = Math.min(this.props.tracks.length - rect.y,
          Math.ceil(Math.max(from.y, to.y)) - rect.y)

        if (rect.y < 0) {
          // Ruler をドラッグしている場合は全てのトラックを選択する
          rect.y = 0
          rect.height = this.props.tracks.length
        }
        if (rect.height <= 0 || rect.width < 3) {
          return null
        }
        return rect
      }

      const startSelection = () => {
        this.setState({
          selection: null
        })
      }

      const resizeSelection = (from, to) => {
        this.setState({
          selection: createRect(from, to)
        })
      }

      const endSelection = (from, to) => {
        this.setState({
          selection: createRect(from, to)
        })
      }

      return <WrappedComponent
        onScrollLeft={onScrollLeft}
        onScrollTop={onScrollTop}
        transform={this.transform}
        startSelection={startSelection}
        resizeSelection={resizeSelection}
        endSelection={endSelection}
        {...this.state}
        {...this.props}
      />
    }
  }
}

const mapStoreToProps = ({ rootStore: {
  rootViewStore: { theme },
  song: { tracks, measureList, endOfSong },
  pianoRollStore: { scaleX, autoScroll },
  services: { player },
  dispatch
} }) => ({
    theme,
    tracks,
    beats: measureList.beats,
    endTick: endOfSong,
    keyHeight: 0.3,
    pixelsPerTick: 0.1 * scaleX,
    autoScroll: autoScroll,
    player,
    dispatch
  })

export default fitToContainer({
  width: "100%",
  height: "100%"
})(inject(mapStoreToProps)(observer(stateful(ArrangeView))))
