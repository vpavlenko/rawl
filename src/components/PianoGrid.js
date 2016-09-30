import React, { PropTypes } from "react"
import DrawCanvas from "./DrawCanvas"
import withTheme from "../hocs/withTheme"
import pureRender from "../hocs/pureRender"

function drawBeatLines(ctx, transform, endTick, ticksPerBeat, theme) {
  const height = transform.getMaxY()
  const pixelsPerTick = transform.getPixelsPerTick()
  ctx.lineWidth = 1

  ctx.beginPath()
  for (let beats = 0; beats < endTick / ticksPerBeat; beats++) {
    const x = beats * ticksPerBeat * pixelsPerTick
    const isBold = beats % 4 == 0
    ctx.strokeStyle = isBold ? theme.secondaryTextColor : theme.dividerColor
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
  }
  ctx.closePath()
  ctx.stroke()
}

function drawHorizontalLines(ctx, transform, endTick, theme) {
  const keyHeight = transform.getPixelsPerKey()
  const numberOfKeys = transform.getMaxNoteNumber()
  const pixelsPerTick = transform.getPixelsPerTick()
  ctx.lineWidth = 1

  const width = pixelsPerTick * endTick

  for (let key = 0; key < numberOfKeys; key++) {
    const index = key % 12
    const isBlack = index == 1 || index == 3 || index == 6 || index == 8 || index == 10
    const isBold = index == 11
    const y = (numberOfKeys - key - 1) * keyHeight
    if (isBlack) {
      ctx.fillStyle = theme.secondaryBackgroundColor
      ctx.fillRect(0, y, width, keyHeight)
    }
    ctx.strokeStyle = isBold ? theme.secondaryTextColor : theme.dividerColor
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.closePath()
    ctx.stroke()
  }
}

function drawGrid(ctx, transform, endTick, ticksPerBeat, theme) {
  ctx.save()
  ctx.translate(0, 0.5)
  drawHorizontalLines(ctx, transform, endTick, theme)
  drawBeatLines(ctx, transform, endTick, ticksPerBeat, theme)
  ctx.restore()
}

function PianoGrid(props) {
  const { transform } = props
  function draw(ctx) {
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)
    drawGrid(ctx, transform, props.endTick, props.ticksPerBeat, props.theme)
  }

  return <DrawCanvas
    draw={draw}
    className="PianoGrid"
    width={transform.getPixelsPerTick() * props.endTick}
    height={transform.getPixelsPerKey() * transform.getMaxNoteNumber()}
    style={props.style}
  />
}

PianoGrid.propTypes = {
  style: PropTypes.object,
  endTick: PropTypes.number.isRequired,
  transform: PropTypes.object.isRequired,
  ticksPerBeat: PropTypes.number.isRequired,
}

export default pureRender(withTheme(PianoGrid))
