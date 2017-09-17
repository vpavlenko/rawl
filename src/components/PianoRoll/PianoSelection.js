import React from "react"
import PropTypes from "prop-types"
import { shouldUpdate } from "recompose"
import _ from "lodash"

import DrawCanvas from "../DrawCanvas"

const LINE_WIDTH = 2

function drawSelection(ctx, selection, transform, theme) {
  if (!selection.enabled) return
  const { x, y, width, height } = selection.getBounds(transform)
  ctx.beginPath()
  ctx.strokeStyle = theme.themeColor
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
  selection,
  transform,
  theme,
  width,
  height
}) {
  function draw(ctx) {
    const { width, height } = ctx.canvas
    ctx.save()
    ctx.clearRect(0, 0, width, height)
    ctx.translate(-scrollLeft, 0)
    drawSelection(ctx, selection, transform, theme)
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
  theme: PropTypes.object.isRequired,
  selection: PropTypes.object.isRequired,
  transform: PropTypes.object.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  scrollLeft: PropTypes.number.isRequired
}

function test(props, nextProps) {
  return !_.isEqual(props.theme, nextProps.theme)
    || !_.isEqual(props.selection, nextProps.selection)
    || !_.isEqual(props.transform, nextProps.transform)
    || props.width !== nextProps.width
    || props.height !== nextProps.height
    || props.scrollLeft !== nextProps.scrollLeft
}

export default shouldUpdate(test)(PianoSelection)
