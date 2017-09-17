import React from "react"
import PropTypes from "prop-types"
import { shouldUpdate } from "recompose"
import _ from "lodash"

import DrawCanvas from "../DrawCanvas"

import "./PianoRuler.css"

function drawRuler(ctx, height, beats, theme) {
  ctx.beginPath()
  ctx.strokeStyle = theme.secondaryTextColor
  ctx.lineWidth = 1

  beats.forEach(({ beat, measure, x }) => {
    const isTop = beat === 0

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
      ctx.fillText(measure, x + 5, 2)
    }
  })

  ctx.closePath()
  ctx.stroke()
}

function PianoRuler({
  width,
  height,
  pixelsPerTick,
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
    drawRuler(ctx, height, beats, theme)
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
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  beats: PropTypes.array.isRequired,
  pixelsPerTick: PropTypes.number.isRequired,
  onMouseDown: PropTypes.func
}

function test(props, nextProps) {
  return props.width !== nextProps.width
    || props.height !== nextProps.height
    || props.pixelsPerTick !== nextProps.pixelsPerTick
    || props.scrollLeft !== nextProps.scrollLeft
    || !_.isEqual(props.beats, nextProps.beats)
    || !_.isEqual(props.theme, nextProps.theme)
}

export default shouldUpdate(test)(PianoRuler)
