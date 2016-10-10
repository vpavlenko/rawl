import React, { Component, PropTypes } from "react"
import _ from "lodash"
import pickMouseEvents from "../helpers/pickMouseEvents"
import DrawCanvas from "./DrawCanvas"
import logEq from "../helpers/logEq"

function rectForNote(note, transform, viewHeight) {
  const { x } = transform.getRect(note)

  const width = 5
  const height = note.velocity / 127 * viewHeight
  return {
    y: viewHeight - height,
    x, width, height
  }
}

/*

    this.controlView.on("change", e => {
      this._track.updateEvent(e.noteId, {velocity: e.velocity})
    })
    // this.controlView.notes = notes
    // this.controlView.endTick = Math.max(100000, tickEnd)
*/

function drawEvent(ctx, rect, note, fillColor, strokeColor) {
  const color = note.selected ? strokeColor : fillColor

  ctx.beginPath()
  ctx.fillStyle = color
  ctx.strokeStyle = strokeColor
  ctx.lineWidth = 1
  ctx.rect(rect.x, rect.y, rect.width, rect.height)
  ctx.fill()
  ctx.stroke()
}

export default class PianoVelocityControl extends Component {
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

      const notes = props.events.filter(e => e.subtype == "note")
      console.log(`[PianoVelocityControl] draw ${notes.length} notes`)

      notes.forEach(note => {
        const rect = rectForNote(note, props.transform, props.height)
        drawEvent(ctx, rect, note, fillColor, strokeColor)
        props.setEventBounds(note.id, rect)
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
  events: PropTypes.array.isRequired,
  endTick: PropTypes.number.isRequired,
  transform: PropTypes.object.isRequired,
  setEventBounds: PropTypes.func.isRequired
}

class _PianoVelocityControl extends Component {
  shouldComponentUpdate(nextProps) {
    const props = this.props
    return !logEq(props, nextProps, "events", _.isEqual)
      || !logEq(props, nextProps, "endTick", (x, y) => x === y)
      || !logEq(props, nextProps, "transform", (x, y) => x && y && x.equals(y))
  }

  render() {
    return <PianoVelocityControl {...this.props} />
  }
}

export default _PianoVelocityControl
