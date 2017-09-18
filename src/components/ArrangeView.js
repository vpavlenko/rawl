import React, { Component } from "react"
import DrawCanvas from "./DrawCanvas"
import NoteCoordTransform from "../model/NoteCoordTransform"
import mapBeats from "../helpers/mapBeats"
import filterEventsWithScroll from "../helpers/filterEventsWithScroll"
import fitToContainer from "../hocs/fitToContainer"
import PianoGrid from "./PianoRoll/PianoGrid"
import PianoRuler from "./PianoRoll/PianoRuler"
import PianoCursor from "./PianoRoll/PianoCursor"
import { VerticalScrollBar, HorizontalScrollBar, BAR_WIDTH } from "./inputs/ScrollBar"

import "./ArrangeView.css"

function drawNote(ctx, rect) {
  const { x, y, width } = rect

  ctx.beginPath()
  ctx.strokeStyle = "blue"
  ctx.lineWidth = 1
  ctx.moveTo(x, y)
  ctx.lineTo(x + width, y)
  ctx.stroke()
}

function ArrangeTrack({
  events,
  transform,
  width,
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
    noteRects.forEach(rect => drawNote(ctx, rect))
    ctx.restore()
  }

  return <DrawCanvas
    draw={draw}
    className="ArrangeTrack"
    width={width}
    height={t.pixelsPerKey * t.numberOfKeys}
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

  // FIXME
  const contentHeight = 1000

  return <div className="ArrangeView">
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
            events={filterEventsWithScroll(t.getEvents(), pixelsPerTick, scrollLeft, containerWidth)}
            transform={transform}
            key={i}
            scrollLeft={scrollLeft}
          />
        )}
      </div>
      <PianoGrid
        width={containerWidth}
        height={containerHeight}
        scrollLeft={scrollLeft}
        beats={mappedBeats}
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
        scrollLeft: 0
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

      return <WrappedComponent
        onScrollLeft={onScrollLeft}
        onScrollTop={onScrollTop}
        transform={this.transform}
        {...this.state}
        {...this.props}
      />
    }
  }
}

export default fitToContainer(stateful(ArrangeView), {
  width: "100%",
  height: "100%"
})
