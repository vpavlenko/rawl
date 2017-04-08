import React, { Component } from "react"
import DrawCanvas from "./DrawCanvas"
import maxX from "../helpers/maxX"

import "./ArrangeView.css"

function drawNote(ctx, rect) {
  const { x, y, width } = rect

  ctx.beginPath()
  ctx.strokeStyle = "blue"
  ctx.lineWidth = 1
  ctx.moveTo(x, y)
  ctx.lineTo(x + width, y)
  ctx.stroke()
}

function ArrangeTrack({
  events,
  transform
}) {
  const t = transform
  const endTick = Math.max(maxX(events), 5000)

  function draw(ctx) {
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)

    ctx.save()
    ctx.translate(0, 0.5)
    events.forEach(note => {
      if (note.subtype !== "note") { return }
      const rect = t.getRect(note)
      drawNote(ctx, rect)
    })
    ctx.restore()
  }

  return <DrawCanvas
    draw={draw}
    className="ArrangeTrack"
    width={t.pixelsPerTick * endTick}
    height={t.pixelsPerKey * t.numberOfKeys}
  />
}

export default class ArrangeView extends Component {
  render() {
    return <div className="ArrangeView">
      {this.props.tracks.map((t, i) =>
        <ArrangeTrack events={t.getEvents()} key={i} />
      )}
    </div>
  }
}
