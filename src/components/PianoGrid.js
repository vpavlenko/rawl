import React, { Component, PropTypes } from "react"
import _ from "lodash"
import DrawCanvas from "./DrawCanvas"
import withTheme from "../hocs/withTheme"
import logEq from "../helpers/logEq"

function drawBeatLines(ctx, transform, endTick, ticksPerBeat, theme) {
  const height = transform.getMaxY()
  const pixelsPerTick = transform.pixelsPerTick
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

function PianoGrid(props) {
  const { transform } = props
  function draw(ctx) {
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)
    ctx.save()
    ctx.translate(0.5, 0.5)
    drawBeatLines(ctx, transform, props.endTick, props.ticksPerBeat, props.theme)
    ctx.restore()
  }

  return <DrawCanvas
    draw={draw}
    className="PianoGrid"
    width={transform.pixelsPerTick * props.endTick}
    height={transform.pixelsPerKey * transform.numberOfKeys}
  />
}

PianoGrid.propTypes = {
  endTick: PropTypes.number.isRequired,
  transform: PropTypes.object.isRequired,
  ticksPerBeat: PropTypes.number.isRequired,
}

class _PianoGrid extends Component {
  shouldComponentUpdate(nextProps) {
    const props = this.props
    return !logEq(props, nextProps, "theme", _.isEqual)
      || !logEq(props, nextProps, "ticksPerBeat", (x, y) => x === y)
      || !logEq(props, nextProps, "endTick", (x, y) => x === y)
      || !logEq(props, nextProps, "transform", (x, y) => x && y && x.equals(y))
  }

  render() {
    return <PianoGrid {...this.props} />
  }
}

export default withTheme(_PianoGrid)
