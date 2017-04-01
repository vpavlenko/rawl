import React, { Component, PropTypes } from "react"
import _ from "lodash"
import DrawCanvas from "./DrawCanvas"
import withTheme from "../hocs/withTheme"
import logEq from "../helpers/logEq"

function drawBeatLines(ctx, transform, startTick, endTick, ticksPerBeat, theme) {
  const height = transform.getMaxY()
  const pixelsPerTick = transform.pixelsPerTick
  ctx.lineWidth = 1
  const startBeat = Math.floor(startTick / ticksPerBeat)
  const endBeat = Math.floor(endTick / ticksPerBeat)

  for (let beats = startBeat; beats < endBeat; beats++) {
    const x = beats * ticksPerBeat * pixelsPerTick
    const isBold = beats % 4 === 0
    ctx.beginPath()
    ctx.strokeStyle = isBold ? theme.secondaryTextColor : theme.dividerColor
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.closePath()
    ctx.stroke()
  }
}

function PianoGrid({
  transform,
  width,
  endTick,
  scrollLeft,
  ticksPerBeat,
  theme
}) {
  function draw(ctx) {
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)
    ctx.save()
    ctx.translate(-scrollLeft + 0.5, 0)
    const startTick = transform.getTicks(scrollLeft)
    drawBeatLines(ctx, transform, startTick, endTick, ticksPerBeat, theme)
    ctx.restore()
  }

  return <DrawCanvas
    draw={draw}
    className="PianoGrid"
    width={width}
    height={transform.pixelsPerKey * transform.numberOfKeys}
  />
}

PianoGrid.propTypes = {
  width: PropTypes.number.isRequired,
  endTick: PropTypes.number.isRequired,
  scrollLeft: PropTypes.number.isRequired,
  ticksPerBeat: PropTypes.number.isRequired,
  theme: PropTypes.object.isRequired,
  transform: PropTypes.object.isRequired
}

class _PianoGrid extends Component {
  shouldComponentUpdate(nextProps) {
    const props = this.props
    return !logEq(props, nextProps, "theme", _.isEqual)
      || !logEq(props, nextProps, "width", (x, y) => x === y)
      || !logEq(props, nextProps, "endTick", (x, y) => x === y)
      || !logEq(props, nextProps, "scrollLeft", (x, y) => x === y)
      || !logEq(props, nextProps, "ticksPerBeat", (x, y) => x === y)
      || !logEq(props, nextProps, "transform", (x, y) => x && y && x.equals(y))
  }

  render() {
    return <PianoGrid {...this.props} />
  }
}

export default withTheme(_PianoGrid)
