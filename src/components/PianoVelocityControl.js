import React, { Component, PropTypes } from "react"
import _ from "lodash"
import pickMouseEvents from "../helpers/pickMouseEvents"
import DrawCanvas from "./DrawCanvas"
import logEq from "../helpers/logEq"

function drawEvent(ctx, fillColor, strokeColor, { x, y, width, height, selected }) {
  const color = selected ? strokeColor : fillColor

  ctx.beginPath()
  ctx.fillStyle = color
  ctx.strokeStyle = strokeColor
  ctx.lineWidth = 1
  ctx.rect(x, y, width, height)
  ctx.fill()
  ctx.stroke()
}

class PianoVelocityControl extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const props = this.props

    function draw(ctx) {
      const { width, height } = ctx.canvas
      ctx.clearRect(0, 0, width, height)

      const fillColor = "blue"
      const strokeColor = "black"

      props.items.forEach(item => {
        drawEvent(ctx, fillColor, strokeColor, item)
      })
    }

    return <DrawCanvas
      className="PianoControl"
      draw={draw}
      width={props.transform.getX(props.endTick)}
      height={props.height}
      {...pickMouseEvents(props)}
    />
  }
}

PianoVelocityControl.propTypes = {
  items: PropTypes.array.isRequired,
  endTick: PropTypes.number.isRequired,
  transform: PropTypes.object.isRequired,
  setEventBounds: PropTypes.func.isRequired
}

class _PianoVelocityControl extends Component {
  shouldComponentUpdate(nextProps) {
    const props = this.props
    return !logEq(props, nextProps, "items", _.isEqual)
      || !logEq(props, nextProps, "endTick", (x, y) => x === y)
      || !logEq(props, nextProps, "transform", (x, y) => x && y && x.equals(y))
  }

  render() {
    return <PianoVelocityControl {...this.props} />
  }
}

export default _PianoVelocityControl
