import React from "react"
import PropTypes from "prop-types"
import { pure } from "recompose"
import DrawCanvas from "components/DrawCanvas.tsx"

function drawCursor(ctx, position, height) {
  ctx.save()
  // ctx.translate(0, 0.5)
  ctx.strokeStyle = "red"
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(position, 0)
  ctx.lineTo(position, height)
  ctx.closePath()
  ctx.stroke()
  ctx.restore()
}

function PianoCursor({
  position,
  width,
  height,
  style
}) {
  function draw(ctx) {
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)
    ctx.save()
    ctx.translate(0.5, 0)
    drawCursor(ctx, Math.round(position), height)
    ctx.restore()
  }

  return <DrawCanvas
    draw={draw}
    className="PianoCursor"
    width={width}
    height={height}
    style={style}
  />
}

PianoCursor.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  position: PropTypes.number.isRequired
}

export default pure(PianoCursor)
