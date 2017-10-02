import React from "react"
import PropTypes from "prop-types"
import { shouldUpdate } from "recompose"
import _ from "lodash"

import DrawCanvas from "../DrawCanvas"

const LINE_WIDTH = 2

function drawSelection(ctx, bounds, color) {
  const { x, y, width, height } = bounds
  ctx.beginPath()
  ctx.strokeStyle = color
  ctx.lineWidth = LINE_WIDTH
  ctx.rect(
    x + LINE_WIDTH / 2,
    y + LINE_WIDTH / 2,
    width - LINE_WIDTH,
    height - LINE_WIDTH)
  ctx.stroke()
}

function PianoSelection({
  scrollLeft,
  selectionBounds,
  color,
  width,
  hidden,
  height
}) {
  function draw(ctx) {
    const { width, height } = ctx.canvas
    ctx.save()
    ctx.clearRect(0, 0, width, height)
    ctx.translate(-scrollLeft, 0)
    if (!hidden) {
      drawSelection(ctx, selectionBounds, color)
    }
    ctx.restore()
  }

  return <DrawCanvas
    draw={draw}
    className="PianoSelection"
    width={width}
    height={height}
  />
}

PianoSelection.propTypes = {
  color: PropTypes.string.isRequired,
  selectionBounds: PropTypes.object.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  scrollLeft: PropTypes.number.isRequired
}

function test(props, nextProps) {
  return props.color !== nextProps.color
    || !_.isEqual(props.selectionBounds, nextProps.selectionBounds)
    || props.width !== nextProps.width
    || props.height !== nextProps.height
    || props.scrollLeft !== nextProps.scrollLeft
    || props.hidden !== nextProps.hidden
}

export default shouldUpdate(test)(PianoSelection)
