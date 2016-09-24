import React, { PropTypes } from "react"
import DrawCanvas from "./draw-canvas"
import pureRender from "../hocs/pure-render"
import Theme from "../theme"
import pickMouseEvents from "../helpers/pickMouseEvents"
import mouseablePianoNotes from "../hocs/mouseable-piano-notes"
import _ from "lodash"

function drawNote(ctx, rect, note, fillColor, strokeColor) {
  const { x, y, width, height } = rect

  const alpha = note.velocity / 127
  const color = note.selected ? strokeColor : fillColor

  ctx.beginPath()
  ctx.fillStyle = color
  ctx.strokeStyle = strokeColor
  ctx.lineWidth = 1
  ctx.rect(x, y, width, height)
  ctx.fill()
  ctx.stroke()

  // draw highlight
  ctx.beginPath()
  ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
  ctx.moveTo(x + 1, y + 1)
  ctx.lineTo(x + width, y + 1)
  ctx.closePath()
  ctx.stroke()
}

/**
  ノートイベントを描画するコンポーネント
  操作のために setEventBounds に描画結果のサイズを返す
*/
function PianoNotes(props) {
  const t = props.transform

  function draw(ctx) {
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)

    const fillColor = "blue"
    const strokeColor = "black"

    const notes = props.events.filter(e => e.subtype == "note")
    console.log(`[PianoNotes] draw ${notes.length} notes`)

    ctx.save()
    ctx.translate(0, 0.5)
    notes.forEach(note => {
      const rect = props.transform.getRect(note)
      drawNote(ctx, rect, note, fillColor, strokeColor)
      props.setEventBounds(note.id, _.assign({}, rect, note)) // TODO 単に rect を渡すようにして、 MouseActionController 側で track から取得させる
    })
    ctx.restore()
  }

  return <DrawCanvas
    draw={draw}
    className="PianoNotes"
    width={t.getPixelsPerTick() * props.endTick}
    height={t.getPixelsPerKey() * t.getMaxNoteNumber()}
    {...pickMouseEvents(props)}
  />
}

PianoNotes.propTypes = {
  events: PropTypes.array.isRequired,
  endTick: PropTypes.number.isRequired,
  transform: PropTypes.object.isRequired,
  setEventBounds: PropTypes.func.isRequired
}

export default mouseablePianoNotes(pureRender(PianoNotes))
