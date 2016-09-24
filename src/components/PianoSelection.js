import React, { PropTypes } from "react"
import Theme from "../model/Theme"
import DrawCanvas from "./DrawCanvas"
import pureRender from "../hocs/pureRender"

const LINE_WIDTH = 2

function drawSelection(ctx, selection, transform) {
  if (!selection.enabled) return
  const { x, y, width, height } = selection.getBounds(transform)
  ctx.beginPath()
  ctx.strokeStyle = Theme.themeColor
  ctx.lineWidth = LINE_WIDTH
  ctx.rect(
    x + LINE_WIDTH / 2,
    y + LINE_WIDTH / 2,
    width - LINE_WIDTH,
    height - LINE_WIDTH)
  ctx.stroke()
}

function PianoSelection(props) {
  function draw(ctx) {
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)
    drawSelection(ctx, props.selection, props.transform)
  }

  return <DrawCanvas
    draw={draw}
    className="PianoSelection"
    width={props.width}
    height={props.height}
  />
}

PianoSelection.propTypes = {
  selection: PropTypes.object,
  transform: PropTypes.object.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired
}

export default pureRender(PianoSelection)
