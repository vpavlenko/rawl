import React from "react"
import DrawCanvas from "./DrawCanvas"
import maxX from "../helpers/maxX"
import NoteCoordTransform from "../model/NoteCoordTransform"
import mapBeats from "../helpers/mapBeats"
import fitToContainer from "../hocs/fitToContainer"
import PianoGrid from "./PianoRoll/PianoGrid"
import PianoRuler from "./PianoRoll/PianoRuler"

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
  const noteRects = events
    .filter(e => e.subtype === "note")
    .map(e => t.getRect(e))

  function draw(ctx) {
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)

    ctx.save()
    ctx.translate(0, 0.5)
    noteRects.forEach(rect => drawNote(ctx, rect))
    ctx.restore()
  }

  return <DrawCanvas
    draw={draw}
    className="ArrangeTrack"
    width={t.pixelsPerTick * endTick}
    height={t.pixelsPerKey * t.numberOfKeys}
  />
}

function ArrangeView({
  tracks,
  theme,
  containerWidth,
  contentHeight,
  beats,
  scrollLeft = 0
}) {
  const keyHeight = 0.3
  const pixelsPerTick = 0.1
  const transform = new NoteCoordTransform(
    pixelsPerTick,
    keyHeight,
    127)
  const startTick = scrollLeft / pixelsPerTick
  const widthTick = containerWidth / pixelsPerTick
  const mappedBeats = mapBeats(beats, pixelsPerTick, startTick, widthTick)
    
  return <div className="ArrangeView">
    <div className="tracks">
      {tracks.map((t, i) =>
        <ArrangeTrack events={t.getEvents()} transform={transform} key={i} />
      )}
    </div>
    <PianoGrid
      width={containerWidth}
      height={contentHeight}
      scrollLeft={scrollLeft}
      beats={mappedBeats}
    />
    <PianoRuler
      width={containerWidth}
      theme={theme}
      height={theme.rulerHeight}
      endTick={widthTick}
      beats={mappedBeats}
      onMouseDown={() => {}}
      scrollLeft={scrollLeft}
      pixelsPerTick={pixelsPerTick}
    />
  </div>
}

export default fitToContainer(ArrangeView, {
  width: "100%",
  height: "100%"
})
