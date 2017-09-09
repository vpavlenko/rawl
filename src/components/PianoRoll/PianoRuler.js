import React from "react"
import PropTypes from "prop-types"
import { pure } from "recompose"
import DrawCanvas from "../DrawCanvas"
import drawBeats from "./drawBeats"

import "./PianoRuler.css"

function drawRuler(ctx, height, pixelsPerTick, startTick, endTick, beats, theme) {
  ctx.beginPath()
  ctx.strokeStyle = theme.secondaryTextColor
  ctx.lineWidth = 1

  drawBeats(beats, pixelsPerTick, startTick, endTick, (beat, x) => {
    const isTop = beat.beat === 0

    if (isTop) {
      ctx.moveTo(x, height / 2)
      ctx.lineTo(x, height)
    } else {
      ctx.moveTo(x, height * 0.8)
      ctx.lineTo(x, height)
    }

    if (isTop) {
      ctx.textBaseline = "top"
      ctx.font = `12px ${theme.canvasFont}`
      ctx.fillStyle = theme.secondaryTextColor
      ctx.fillText(beat.measure, x + 5, 2)
    }
  })

  ctx.closePath()
  ctx.stroke()
}

function PianoRuler({
  width,
  height,
  pixelsPerTick,
  endTick,
  scrollLeft,
  beats,
  theme,
  onMouseDown,
  onMouseMove,
  onMouseUp
}) {

  function draw(ctx) {
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)
    ctx.save()
    ctx.translate(-scrollLeft + 0.5, 0)
    const startTick = scrollLeft / pixelsPerTick
    drawRuler(ctx, height, pixelsPerTick, startTick, endTick, beats, theme)
    ctx.restore()
  }

  const extend = func => e => func && func({
    ...e,
    tick: (e.nativeEvent.offsetX + scrollLeft) / pixelsPerTick
  })

  return <DrawCanvas
    draw={draw}
    className="PianoRuler"
    width={width}
    height={height}
    onMouseDown={extend(onMouseDown)}
    onMouseMove={extend(onMouseMove)}
    onMouseUp={extend(onMouseUp)}
  />
}

PianoRuler.propTypes = {
  scrollLeft: PropTypes.number.isRequired,
  endTick: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  pixelsPerTick: PropTypes.number.isRequired,
  beats: PropTypes.array.isRequired,
  onMouseDown: PropTypes.func
}

export default pure(PianoRuler)
