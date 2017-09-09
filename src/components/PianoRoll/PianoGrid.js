import React, { Component } from "react"
import PropTypes from "prop-types"
import _ from "lodash"
import DrawCanvas from "../DrawCanvas"
import withTheme from "../../hocs/withTheme"
import logEq from "../../helpers/logEq"
import drawBeats from "./drawBeats"

function drawBeatLines(ctx, beats, height, pixelsPerTick, startTick, endTick, theme) {
  ctx.lineWidth = 1

  drawBeats(beats, pixelsPerTick, startTick, endTick, (beat, x) => {
    const isBold = beat.beat === 0
    ctx.beginPath()
    ctx.strokeStyle = isBold ? theme.secondaryTextColor : theme.dividerColor
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.closePath()
    ctx.stroke()
  })
}

function PianoGrid({
  transform,
  width,
  height,
  endTick,
  scrollLeft,
  beats,
  theme
}) {
  function draw(ctx) {
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)
    ctx.save()
    ctx.translate(-scrollLeft + 0.5, 0)
    const startTick = transform.getTicks(scrollLeft)
    drawBeatLines(ctx, beats, height, transform.pixelsPerTick, startTick, endTick, theme)
    ctx.restore()
  }

  return <DrawCanvas
    draw={draw}
    className="PianoGrid"
    width={width}
    height={height}
  />
}

PianoGrid.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  endTick: PropTypes.number.isRequired,
  scrollLeft: PropTypes.number.isRequired,
  theme: PropTypes.object.isRequired,
  transform: PropTypes.object.isRequired,
  beats: PropTypes.array.isRequired
}

class _PianoGrid extends Component {
  shouldComponentUpdate(nextProps) {
    const props = this.props
    return !logEq(props, nextProps, "theme", _.isEqual)
      || !logEq(props, nextProps, "width", (x, y) => x === y)
      || !logEq(props, nextProps, "height", (x, y) => x === y)
      || !logEq(props, nextProps, "endTick", (x, y) => x === y)
      || !logEq(props, nextProps, "scrollLeft", (x, y) => x === y)
      || !logEq(props, nextProps, "ticksPerBeat", (x, y) => x === y)
      || !logEq(props, nextProps, "transform", (x, y) => x && y && x.equals(y))
      || !logEq(props, nextProps, "beats", (x, y) => x === y)
  }

  render() {
    return <PianoGrid {...this.props} />
  }
}

export default withTheme(_PianoGrid)
