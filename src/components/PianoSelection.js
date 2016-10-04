import React, { PropTypes } from "react"
import DrawCanvas from "./DrawCanvas"
import withTheme from "../hocs/withTheme"
import pureRender from "../hocs/pureRender"

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

function PianoSelection(props) {
  function draw(ctx) {
    const { width, height } = ctx.canvas
    ctx.save()
    ctx.clearRect(0, 0, width, height)
    ctx.translate(-props.scrollLeft, 0.5)
    drawSelection(ctx, props.selection, props.transform, props.theme)
    ctx.restore()
  }

  return <DrawCanvas
    draw={draw}
    className="PianoSelection"
    width={props.width}
    height={props.height}
    style={props.style}
  />
}

PianoSelection.propTypes = {
  selection: PropTypes.object,
  transform: PropTypes.object.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired
}

export default pureRender(withTheme(PianoSelection))
