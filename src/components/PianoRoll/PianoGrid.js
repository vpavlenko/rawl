import React, { Component } from "react"
import PropTypes from "prop-types"
import _ from "lodash"
import DrawCanvas from "../DrawCanvas"
import withTheme from "../../hocs/withTheme"
import logEq from "../../helpers/logEq"

function drawBeatLines(ctx, beats, height, theme) {
  ctx.lineWidth = 1

  beats.forEach(({ beat, x }) => {
    const isBold = beat === 0
    ctx.beginPath()
    ctx.strokeStyle = isBold ? theme.secondaryTextColor : theme.dividerColor
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.closePath()
    ctx.stroke()
  })
}

function PianoGrid({
  width,
  height,
  scrollLeft,
  beats,
  theme
}) {
  function draw(ctx) {
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)
    ctx.save()
    ctx.translate(-scrollLeft + 0.5, 0)
    drawBeatLines(ctx, beats, height, theme)
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
  scrollLeft: PropTypes.number.isRequired,
  theme: PropTypes.object.isRequired,
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
