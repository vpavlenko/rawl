import React, { Component } from "react"
import Color from "color"
import { pure } from "recompose"
import _ from "lodash"

import DrawCanvas from "./DrawCanvas"
import PianoRuler from "./PianoRuler"
import PianoGrid from "./PianoGrid"
import PianoCursor from "./PianoCursor"
import fitToContainer from "../hocs/fitToContainer"
import tempoGraphPresentation from "../presentations/tempoGraph"
import withTheme from "../hocs/withTheme"
import TempoCoordTransform from "../model/TempoCoordTransform"
import { uSecPerBeatToBPM, bpmToUSecPerBeat } from "../helpers/bpm"
import { SetTempoMidiEvent } from "../midi/MidiEvent"

import "./TempoGraph.css"

function Graph({ items, width, height, fillColor, strokeColor, onMouseDown, onWheel, onDoubleClick, scrollLeft }) {
  if (!width) {
    return null
  }

  function draw(ctx) {
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)

    ctx.save()
    ctx.translate(0.5, 0.5)
    ctx.fillStyle = fillColor
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = 1
    items.forEach(item => {
      ctx.beginPath()
      ctx.rect(item.x, item.y, item.width, item.height)
      ctx.fill()
      ctx.stroke()
    })
    ctx.restore()
  }

  // ローカル座標や、どの item の上でクリックされたかなどの追加情報を作成する
  function itemUnderPoint(e) {
    const x = e.nativeEvent.offsetX
    return items.filter(b =>
      x >= b.x &&
      x <= b.x + b.width
    )[0]
  }

  function _onMouseDown(e) {
    onMouseDown({
      ...e,
      item: itemUnderPoint(e)
    })
  }

  function _onWheel(e) {
    onWheel({
      ...e,
      item: itemUnderPoint(e)
    })
  }

  return <DrawCanvas
    draw={draw}
    width={width}
    height={height}
    className="Graph"
    onContextMenu={e => e.preventDefault()}
    onMouseDown={_onMouseDown}
    onDoubleClick={onDoubleClick}
    onWheel={_onWheel}
  />
}

function HorizontalLines({ width, height, transform, borderColor }) {
  if (!width) {
    return null
  }

  function draw(ctx) {
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)

    ctx.save()
    ctx.translate(0.5, 0.5)

    ctx.strokeStyle = borderColor
    ctx.lineWidth = 1

    // 30 -> 510 を 17 分割した線
    ctx.beginPath()
    for (let i = 30; i < transform.maxBPM; i += 30) {
      const y = Math.round(transform.getY(i))

      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
    }
    ctx.stroke()
    ctx.restore()
  }

  return <DrawCanvas
    draw={draw}
    width={width}
    height={height}
    className="HorizontalLines"
    onContextMenu={e => e.preventDefault()}
  />
}

const GraphAxis = pure(({ width, height, transform, offset }) => {
  return <div className="GraphAxis" style={{ width }}>
    {_.range(60, transform.maxBPM, 30).map(t => {
      const top = Math.round(transform.getY(t)) + offset
      return <div style={{ top }} key={t}>{t}</div>
    })}
  </div>
})

const PseudoWidthContent = pure(({ onmount, width }) => {
  return <div ref={onmount} style={{
    width,
    height: "100%"
  }} />
})

const FixedLeftContent = pure(({ children, left }) => {
  return <div className="fixed-left" style={{
    left,
    position: "absolute",
    top: 0
  }}>
    {children}
  </div>
})

function Content({
  track,
  containerWidth,
  containerHeight,
  theme,
  playerPosition,
  endTick,
  onScroll,
  scrollLeft
}) {
  const { keyWidth, rulerHeight } = theme

  const pixelsPerTick = 0.1
  const ticksPerBeat = 480
  const transform = new TempoCoordTransform(pixelsPerTick, containerHeight)
  const widthTick = Math.max(endTick, transform.getTicks(containerWidth))
  const contentWidth = widthTick * pixelsPerTick
  const contentHeight = containerHeight - rulerHeight

  const items = tempoGraphPresentation(track.getEvents(), transform, contentWidth, scrollLeft)

  function onMouseDownGraph(e) {
    if (!e.item) {
      return
    }

    const event = track.getEventById(e.item.id)
    const bpm = uSecPerBeatToBPM(event.microsecondsPerBeat)
    const startY = e.clientY

    function onMouseMove(e) {
      const delta = transform.getDeltaBPM(e.clientY - startY)

      track.updateEvent(event.id, {
        microsecondsPerBeat: bpmToUSecPerBeat(bpm + delta)
      })
    }

    function onMouseUp() {
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
    }

    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
  }

  function onWheelGraph(e) {
    if (!e.item) {
      return
    }
    const event = track.getEventById(e.item.id)
    const movement = e.deltaY > 0 ? -1 : 1
    const bpm = uSecPerBeatToBPM(event.microsecondsPerBeat)
    track.updateEvent(e.item.id, {
      microsecondsPerBeat: bpmToUSecPerBeat(bpm + movement)
    })
  }

  function onDoubleClickGraph(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const tick = transform.getTicks(e.clientX - rect.left)
    const bpm = transform.getBPM(e.clientY - rect.top)
    const event = new SetTempoMidiEvent(tick, uSecPerBeatToBPM(bpm))
    track.addEvent(event)
  }

  return <div className="TempoGraph" onScroll={onScroll}>
    <PseudoWidthContent width={contentWidth} />
    <FixedLeftContent left={scrollLeft}>
      <PianoGrid
        width={containerWidth}
        height={contentHeight}
        scrollLeft={scrollLeft}
        transform={transform}
        endTick={widthTick}
        ticksPerBeat={ticksPerBeat}
      />
      <HorizontalLines
        width={containerWidth}
        height={contentHeight}
        transform={transform}
        borderColor={theme.dividerColor}
      />
      <Graph
        items={items}
        transform={transform}
        width={containerWidth}
        height={contentHeight}
        strokeColor={theme.themeColor}
        fillColor={Color(theme.themeColor).alpha(0.1).string()}
        onMouseDown={onMouseDownGraph}
        onDoubleClick={onDoubleClickGraph}
        onWheel={onWheelGraph}
        scrollLeft={scrollLeft}
      />
      <PianoCursor
        width={containerWidth}
        height={contentHeight}
        position={transform.getX(playerPosition)}
      />
      <PianoRuler
        height={rulerHeight}
        endTick={widthTick}
        ticksPerBeat={ticksPerBeat}
        onMouseDown={() => {}}
        scrollLeft={scrollLeft}
        pixelsPerTick={pixelsPerTick}
      />
      <GraphAxis
        width={keyWidth}
        height={contentHeight}
        offset={rulerHeight}
        transform={transform}
      />
    </FixedLeftContent>
  </div>
}

function stateful(WrappedComponent) {
  return class extends Component {
    constructor(props) {
      super(props)

      this.state = {
        playerPosition: props.player.position,
        scrollLeft: 0
      }
    }

    componentDidMount() {
      this.props.player.on("change-position", this.updatePosition)
    }

    componentWillUnmount() {
      this.props.player.off("change-position", this.updatePosition)
    }

    updatePosition = (tick) => {
      this.setState({
        playerPosition: tick
      })
    }

    onScroll = e => {
      this.setState({
        scrollLeft: e.target.scrollLeft
      })
    }

    render() {
      return <WrappedComponent
        onScroll={this.onScroll}
        {...this.state}
        {...this.props}
      />
    }
  }
}

export default stateful(withTheme(fitToContainer(Content, {
  width: "100%",
  height: "100%"
})))
