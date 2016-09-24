import React, { PropTypes } from "react"
import Theme from "../model/Theme"
import DrawCanvas from "./DrawCanvas"
import pureRender from "../hocs/pureRender"

function drawBeatLines(ctx, height, pixelsPerTick, endTick, ticksPerBeat) {
  ctx.lineWidth = 1

  ctx.beginPath()
  for (let beats = 0; beats < endTick / ticksPerBeat; beats++) {
    const x = beats * ticksPerBeat * pixelsPerTick
    const isBold = beats % 4 == 0
    ctx.strokeStyle = Theme.getDividerColorAccented(isBold)
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
  }
  ctx.closePath()
  ctx.stroke()
}

function drawHorizontalLines(ctx, keyHeight, numberOfKeys, pixelsPerTick, endTick) {
  ctx.lineWidth = 1

  const width = pixelsPerTick * endTick

  for (let key = 0; key < numberOfKeys; key++) {
    const index = key % 12
    const isBlack = index == 1 || index == 3 || index == 6 || index == 8 || index == 10
    const isBold = index == 11
    const y = (numberOfKeys - key - 1) * keyHeight
    if (isBlack) {
      ctx.fillStyle = Theme.secondaryBackgroundColor
      ctx.fillRect(0, y, width, keyHeight)
    }
    ctx.strokeStyle = Theme.getDividerColorAccented(isBold)
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.closePath()
    ctx.stroke()
  }
}

function drawGrid(ctx, keyHeight, numberOfKeys, pixelsPerTick, endTick, ticksPerBeat) {
  ctx.save()
  ctx.translate(0, 0.5)
  drawHorizontalLines(ctx, keyHeight, numberOfKeys, pixelsPerTick, endTick)
  drawBeatLines(ctx, keyHeight * numberOfKeys, pixelsPerTick, endTick, ticksPerBeat)
  ctx.restore()
}

function PianoGrid(props) {
  function draw(ctx) {
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)
    drawGrid(ctx, props.keyHeight, props.numberOfKeys, props.pixelsPerTick, props.endTick, props.ticksPerBeat)
  }

  return <DrawCanvas
    draw={draw}
    className="PianoGrid"
    width={props.pixelsPerTick * props.endTick}
    height={props.keyHeight * props.numberOfKeys}
    style={props.style}
  />
}

PianoGrid.propTypes = {
  style: PropTypes.object,
  endTick: PropTypes.number.isRequired,
  keyHeight: PropTypes.number.isRequired,
  numberOfKeys: PropTypes.number.isRequired,
  ticksPerBeat: PropTypes.number.isRequired,
  pixelsPerTick: PropTypes.number.isRequired
}

export default pureRender(PianoGrid)
