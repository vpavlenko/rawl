import React, { PropTypes } from "react"
import DrawCanvas from "./DrawCanvas"
import withTheme from "../hocs/withTheme"
import pureRender from "../hocs/pureRender"

function drawRuler(ctx, height, pixelsPerTick, startTick, endTick, ticksPerBeat, theme) {
  ctx.beginPath()
  ctx.strokeStyle = theme.secondaryTextColor
  ctx.lineWidth = 1
  const startBeat = Math.floor(startTick / ticksPerBeat)
  const endBeat = Math.floor(endTick / ticksPerBeat)

  for (let beats = startBeat; beats < endBeat; beats++) {
    const x = beats * ticksPerBeat * pixelsPerTick
    const isTop = beats % 4 == 0

    if (isTop) {
      ctx.moveTo(x, height / 2)
      ctx.lineTo(x, height)
    } else {
      ctx.moveTo(x, height * 0.8)
      ctx.lineTo(x, height)
    }

    if (isTop) {
      const measure = beats / 4
      ctx.textBaseline = "top"
      ctx.font = `12px ${theme.canvasFont}`
      ctx.fillStyle = theme.secondaryTextColor
      ctx.fillText(measure, x + 5, 2)
    }
  }

  ctx.closePath()
  ctx.stroke()
}

function PianoRuler({ height, transform, endTick, scrollLeft, ticksPerBeat, theme, onMouseDown }) {

  function draw(ctx) {
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)
    ctx.save()
    ctx.translate(-scrollLeft + 0.5, 0)
    const startTick = transform.getTicks(scrollLeft)
    drawRuler(ctx, height, transform.pixelsPerTick, startTick, endTick, ticksPerBeat, theme)
    ctx.restore()
  }

  return <DrawCanvas
    draw={draw}
    className="PianoRuler"
    width={transform.pixelsPerTick * endTick}
    height={height}
    onMouseDown={onMouseDown}
  />
}

PianoRuler.propTypes = {
  ticksPerBeat: PropTypes.number.isRequired,
  scrollLeft: PropTypes.number.isRequired,
  endTick: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  transform: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  onMouseDown: PropTypes.func
}

export default pureRender(withTheme(PianoRuler))
