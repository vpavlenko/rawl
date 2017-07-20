import React, { Component } from "react"
import DrawCanvas from "./DrawCanvas"

function drawEvents(ctx, strokeColor, items, center) {
  ctx.beginPath()
  ctx.strokeStyle = strokeColor
  ctx.lineWidth = 2
  let prevY = center

  for (let item of items) {
    const x = Math.round(item.x)
    const y = Math.round(item.y)
    ctx.lineTo(x, prevY)
    ctx.lineTo(x, y)
    prevY = y
  }

  ctx.stroke()
}

function PitchGraph({
  width,
  height,
  scrollLeft,
  items
}) {
  function draw(ctx) {
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)

    const strokeColor = "blue"

    ctx.save()
    ctx.translate(-Math.round(scrollLeft), 0)
    drawEvents(ctx, strokeColor, items, height / 2)
    ctx.restore()
  }

  return <DrawCanvas
    className="PianoControl PitchGraph"
    draw={draw}
    width={width}
    height={height}
  />
}

export default PitchGraph
