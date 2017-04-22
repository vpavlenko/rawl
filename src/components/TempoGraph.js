import React from "react"
import Color from "color"
import DrawCanvas from "./DrawCanvas"
import PianoRuler from "./PianoRuler"
import PianoGrid from "./PianoGrid"
import fitToContainer from "../hocs/fitToContainer"
import tempoGraphPresentation from "../presentations/tempoGraph"
import withTheme from "../hocs/withTheme"
import TempoCoordTransform from "../model/TempoCoordTransform"
import { uSecPerBeatToBPM, bpmToUSecPerBeat } from "../helpers/bpm"
import { SetTempoMidiEvent } from "../midi/MidiEvent"

import "./TempoGraph.css"

function Graph({ items, width, height, fillColor, strokeColor, onMouseDown, onWheel, onDoubleClick }) {
  if (!width) {
    return null
  }

  function draw(ctx) {
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)

    ctx.save()
    ctx.translate(0.5, 0.5)
    items.forEach(item => {
      ctx.beginPath()
      ctx.fillStyle = fillColor
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = 1
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
    onContextMenu={e => e.preventDefault()}
    style={{ position: "absolute", left: 0, top: 0 }}
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
    for (let i = 30; i < transform.maxBPM; i += 30) {
      const y = Math.round(transform.getY(i))

      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.closePath()
      ctx.stroke()
    }

    ctx.restore()
  }

  return <DrawCanvas
    draw={draw}
    width={width}
    height={height}
    onContextMenu={e => e.preventDefault()}
    style={{ position: "absolute", left: 0, top: 0 }}
  />
}

function Content({ track, containerWidth, containerHeight, theme }) {
  const { rulerHeight } = theme

  const pixelsPerTick = 0.1
  const endTick = 10000
  const ticksPerBeat = 480
  const scrollLeft = 0
  const transform = new TempoCoordTransform(pixelsPerTick, containerHeight)

  const items = tempoGraphPresentation(track.getEvents(), transform, containerWidth)

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

  return <div className="TempoGraph">
    <PianoGrid
      width={containerWidth}
      height={containerHeight}
      scrollLeft={scrollLeft}
      transform={transform}
      endTick={endTick}
      ticksPerBeat={ticksPerBeat}
    />
    <HorizontalLines
      width={containerWidth}
      height={containerHeight}
      transform={transform}
      borderColor={theme.dividerColor}
    />
    <Graph
      items={items}
      transform={transform}
      width={containerWidth}
      height={containerHeight}
      strokeColor={theme.themeColor}
      fillColor={Color(theme.themeColor).alpha(0.1).string()}
      onMouseDown={onMouseDownGraph}
      onDoubleClick={onDoubleClickGraph}
      onWheel={onWheelGraph}
    />
    <PianoRuler
      height={rulerHeight}
      endTick={endTick}
      ticksPerBeat={ticksPerBeat}
      onMouseDown={() => {}}
      scrollLeft={scrollLeft}
      pixelsPerTick={pixelsPerTick}
    />
  </div>
}

export default withTheme(fitToContainer(Content, {
  width: "100%",
  height: "100%"
}))
