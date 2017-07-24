import React, { Component } from "react"
import PropTypes from "prop-types"
import _ from "lodash"
import DrawCanvas from "../DrawCanvas"
import VelocityMouseHandler from "./VelocityMouseHandler"
import logEq from "../../helpers/logEq"
import filterEventsWithScroll from "../../helpers/filterEventsWithScroll"

/**

 [{x, y, width, height, selected}, ...]

*/
function transformEvents(events, transform, scrollLeft, width, viewHeight) {
  return filterEventsWithScroll(events, transform, scrollLeft, width)
    .filter(e => e.subtype === "note")
    .map(note => {
      const { x } = transform.getRect(note)
      const width = 5
      const height = note.velocity / 127 * viewHeight
      return {
        id: note.id,
        velocity: note.velocity,
        selected: note.selected,
        y: viewHeight - height,
        x, width, height
      }
    })
}

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
  events,
  transform,
  scrollLeft,
  dispatch,
  velocityMouseHandler
}) {
  const items = transformEvents(events, transform, scrollLeft, width, height)

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

  const extendEvent = func => e => func({
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

  velocityMouseHandler.dispatch = dispatch

  return <DrawCanvas
    className="PianoControl VelocityControl"
    draw={draw}
    width={width}
    height={height}
    onMouseDown={extendEvent(e => velocityMouseHandler.onMouseDown(e))}
  />
}

class _PianoVelocityControl extends Component {
  constructor(props) {
    super(props)

    this.state = {
      velocityMouseHandler: new VelocityMouseHandler()
    }
  }

  shouldComponentUpdate(nextProps) {
    const props = this.props
    return !logEq(props, nextProps, "items", _.isEqual)
      || !logEq(props, nextProps, "scrollLeft")
      || !logEq(props, nextProps, "width")
      || !logEq(props, nextProps, "height")
      || !logEq(props, nextProps, "events")
      || !logEq(props, nextProps, "transform")
  }

  render() {
    return <PianoVelocityControl {...this.props} {...this.state} />
  }
}

export default _PianoVelocityControl
