import React, { PropTypes } from "react"
import DrawCanvas from "./DrawCanvas"
import pureRender from "../hocs/pureRender"

function drawCursor(ctx, position, height) {
  ctx.save()
  // ctx.translate(0, 0.5)
  ctx.strokeStyle = "red"
  ctx.beginPath()
  ctx.moveTo(position, 0)
  ctx.lineTo(position, height)
  ctx.closePath()
  ctx.stroke()
  ctx.restore()
}

function PianoCursor(props) {
  function draw(ctx) {
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)
    drawCursor(ctx, props.position, height)
  }

  return <DrawCanvas
    draw={draw}
    className="PianoCursor"
    width={props.width}
    height={props.height}
    style={props.style}
  />
}

PianoCursor.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  position: PropTypes.number.isRequired
}

export default pureRender(PianoCursor)
