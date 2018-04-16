import React, { Component } from "react"
import { observer, inject } from "mobx-react"
import _ from "lodash"
import Color from "color"
import { pure } from "recompose"
import sizeMe from "react-sizeme"

import PianoGrid from "containers/PianoRollEditor/PianoRoll/PianoGrid"
import PianoRuler from "containers/PianoRollEditor/PianoRoll/PianoRuler"
import PianoCursor from "containers/PianoRollEditor/PianoRoll/PianoCursor"

import { TempoCoordTransform } from "common/transform"

import mapBeats from "helpers/mapBeats"
import { uSecPerBeatToBPM, bpmToUSecPerBeat } from "helpers/bpm"
import transformEvents from "./transformEvents.ts"

import Stage from "components/Stage/Stage"
import DrawCanvas from "components/DrawCanvas.tsx"
import { HorizontalScrollBar, BAR_WIDTH } from "components/inputs/ScrollBar"

import "./TempoGraph.css"

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

const GraphAxis = pure(({ width, transform, offset }) => {
  return <div className="GraphAxis" style={{ width }}>
    <div className="values">
      {_.range(30, transform.maxBPM, 30).map(t => {
        const top = Math.round(transform.getY(t)) + offset
        return <div style={{ top }} key={t}>{t}</div>
      })}
    </div>
  </div>
})

function Content({
  track,
  events,
  size,
  pixelsPerTick,
  theme,
  beats,
  playerPosition,
  setPlayerPosition,
  endTick,
  scrollLeft,
  setScrollLeft,
  changeTempo,
  createTempo
}) {
  scrollLeft = Math.floor(scrollLeft)

  const { keyWidth, rulerHeight } = theme

  const containerWidth = size.width
  const containerHeight = size.height

  const contentHeight = containerHeight - rulerHeight - BAR_WIDTH
  const transform = new TempoCoordTransform(pixelsPerTick, contentHeight)
  const widthTick = Math.max(endTick, transform.getTicks(containerWidth))
  const contentWidth = widthTick * pixelsPerTick

  const items = transformEvents(events, transform, contentWidth,
    theme.themeColor,
    Color(theme.themeColor).alpha(0.1).string())

  function onMouseDownGraph(e) {
    const item = e.items[0]
    if (!item) {
      return
    }

    const event = track.getEventById(item.id)
    const bpm = uSecPerBeatToBPM(event.microsecondsPerBeat)
    const startY = e.clientY

    function onMouseMove(e) {
      const delta = transform.getDeltaBPM(e.clientY - startY)
      changeTempo({
        id: event.id,
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
    const item = e.items[0]
    if (!item) {
      return
    }
    const event = track.getEventById(item.id)
    const movement = e.deltaY > 0 ? -1 : 1
    const bpm = uSecPerBeatToBPM(event.microsecondsPerBeat)
    changeTempo({
      id: event.id,
      microsecondsPerBeat: bpmToUSecPerBeat(bpm + movement)
    })
  }

  function onDoubleClickGraph(e) {
    const tick = transform.getTicks(e.local.x)
    const bpm = transform.getBPM(e.local.y)
    createTempo({
      tick,
      microsecondsPerBeat: uSecPerBeatToBPM(bpm)
    })
  }

  const startTick = scrollLeft / pixelsPerTick
  const mappedBeats = mapBeats(beats, pixelsPerTick, startTick, widthTick)
  const width = containerWidth - keyWidth

  function onScrollLeft(e) {
    setScrollLeft(e.scroll)
  }

  return <div className="TempoGraph">
    <PianoGrid
      theme={theme}
      width={width}
      height={contentHeight}
      scrollLeft={scrollLeft}
      beats={mappedBeats}
    />
    <HorizontalLines
      width={width}
      height={contentHeight}
      transform={transform}
      borderColor={theme.dividerColor}
    />
    <Stage
      className="Graph"
      items={items}
      width={width}
      height={contentHeight}
      onMouseDown={onMouseDownGraph}
      onDoubleClick={onDoubleClickGraph}
      onWheel={onWheelGraph}
      scrollLeft={scrollLeft}
    />
    <PianoCursor
      width={width}
      height={contentHeight}
      position={transform.getX(playerPosition) - scrollLeft}
    />
    <PianoRuler
      theme={theme}
      width={width}
      height={rulerHeight}
      beats={mappedBeats}
      onMouseDown={({ tick }) => setPlayerPosition(tick)}
      scrollLeft={scrollLeft}
      pixelsPerTick={pixelsPerTick}
    />
    <GraphAxis
      width={keyWidth}
      height={contentHeight}
      offset={rulerHeight}
      transform={transform}
    />
    <HorizontalScrollBar
      scrollOffset={scrollLeft}
      contentLength={contentWidth}
      onScroll={onScrollLeft} />
  </div>
}

function stateful(WrappedComponent) {
  return class extends Component {
    constructor(props) {
      super(props)

      this.state = {
        playerPosition: props.player.position
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

      const { autoScroll, pixelsPerTick, size } = this.props

      // keep scroll position to cursor
      if (autoScroll) {
        const transform = new TempoCoordTransform(pixelsPerTick, size.height)
        const x = transform.getX(tick)
        const screenX = x - this.state.scrollLeft
        if (screenX > size.width * 0.7 || screenX < 0) {
          this.props.setScrollLeft(x)
        }
      }
    }

    render() {
      return <WrappedComponent
        {...this.state}
        {...this.props}
      />
    }
  }
}


export default sizeMe({ monitorHeight: true })(inject(({ rootStore: {
  rootViewStore: { theme },
  tempoEditorStore: s,
  services: { player },
  song,
  dispatch
} }) => ({
  theme,
  player,
  pixelsPerTick: 0.1 * s.scaleX,
  track: song.conductorTrack,
  events: song.conductorTrack.events.toJS(),
  endTick: song.endOfSong,
  beats: song.measureList.beats,
  autoScroll: s.autoScroll,
  scrollLeft: s.scrollLeft,
  setScrollLeft: v => s.scrollLeft = v,
  changeTempo: p => dispatch("CHANGE_TEMPO", p),
  createTempo: p => dispatch("CREATE_TEMPO", p),
  setPlayerTempo: tick => dispatch("SET_PLAYER_POSITION", { tick })
}))(observer(stateful(Content))))
