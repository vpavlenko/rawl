import React, { Component } from "react"
import PropTypes from "prop-types"
import _ from "lodash"
import DrawCanvas from "./DrawCanvas"
import logEq from "../helpers/logEq"

function drawEvent(ctx, fillColor, strokeColor, { x, y, width, height, selected }) {
  const color = selected ? strokeColor : fillColor

  x = Math.round(x)
  y = Math.round(y)
  width = Math.round(width)
  height = Math.round(height)

  ctx.beginPath()
  ctx.fillStyle = color
  ctx.strokeStyle = strokeColor
  ctx.lineWidth = 1
  ctx.rect(x, y, width, height)
  ctx.fill()
  ctx.stroke()
}

function PianoVelocityControl({
  width,
  height,
  items,
  scrollLeft,
  onMouseDown,
  onMouseMove,
  onMouseUp
}) {
  function eventOption(e) {
    function getLocal(e) {
      return {
        x: e.nativeEvent.offsetX + scrollLeft,
        y: e.nativeEvent.offsetY
      }
    }
    function itemsUnderPoint({ x }) {
      return items
        .filter(b => {
          return x >= b.x
            && x <= b.x + b.width
        })
    }
    const local = getLocal(e)

    return {
      local,
      items: itemsUnderPoint(local)
    }
  }

  const _onMouseDown = e =>
    onMouseDown({
      ...e,
      ...eventOption(e)
    })

  const _onMouseMove = e =>
    onMouseMove({
      ...e,
      ...eventOption(e)
    })

  const _onMouseUp = e =>
    onMouseUp({
      ...e,
      ...eventOption(e)
    })

  function draw(ctx) {
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)

    const fillColor = "blue"
    const strokeColor = "black"

    ctx.save()
    ctx.translate(0.5 - Math.round(scrollLeft), 0.5)
    items.forEach(item => drawEvent(ctx, fillColor, strokeColor, item))
    ctx.restore()
  }

  return <DrawCanvas
    className="PianoControl"
    draw={draw}
    width={width}
    height={height}
    onMouseDown={_onMouseDown}
    onMouseMove={_onMouseMove}
    onMouseUp={_onMouseUp}
  />
}

PianoVelocityControl.propTypes = {
  items: PropTypes.array.isRequired
}

class _PianoVelocityControl extends Component {
  shouldComponentUpdate(nextProps) {
    const props = this.props
    return !logEq(props, nextProps, "items", _.isEqual)
      || !logEq(props, nextProps, "scrollLeft")
      || !logEq(props, nextProps, "width")
      || !logEq(props, nextProps, "height")
      || !logEq(props, nextProps, "onMouseDown")
      || !logEq(props, nextProps, "onMouseMove")
      || !logEq(props, nextProps, "onMouseUp")
  }

  render() {
    return <PianoVelocityControl {...this.props} />
  }
}

export default _PianoVelocityControl
