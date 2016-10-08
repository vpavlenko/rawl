import React, { Component, PropTypes } from "react"
import _ from "lodash"
import DrawCanvas from "./DrawCanvas"
import pickMouseEvents from "../helpers/pickMouseEvents"
import mouseablePianoNotes from "../hocs/mouseablePianoNotes"
import logEq from "../helpers/logEq"

function drawNote(ctx, rect, note, fillColor, strokeColor) {
  const { x, y, width, height } = rect

  const alpha = note.velocity / 127
  const color = note.selected ? "black" : `rgba(0, 0, 255, ${alpha})`

  ctx.beginPath()
  ctx.fillStyle = color
  ctx.strokeStyle = "black"
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

    const notes = props.events.filter(e => e.subtype == "note")
    console.log(`[PianoNotes] draw ${notes.length} notes`)

    ctx.save()
    ctx.translate(-props.scrollLeft, 0.5)
    notes.forEach(note => {
      const rect = props.transform.getRect(note)
      drawNote(ctx, rect, note)
      props.setEventBounds(note.id, _.assign({}, rect, note)) // TODO 単に rect を渡すようにして、 MouseActionController 側で track から取得させる
    })
    ctx.restore()
  }

  return <DrawCanvas
    draw={draw}
    className="PianoNotes"
    width={props.width}
    height={t.pixelsPerKey * t.numberOfKeys}
    {...pickMouseEvents(props)}
    style={props.style}
  />
}

PianoNotes.propTypes = {
  width: PropTypes.number.isRequired,
  events: PropTypes.array.isRequired,
  transform: PropTypes.object.isRequired,
  scrollLeft: PropTypes.number.isRequired,
  setEventBounds: PropTypes.func.isRequired
}

class _PianoNotes extends Component {
  shouldComponentUpdate(nextProps) {
    const props = this.props
    return !logEq(props, nextProps, "events", _.isEqual)
      || !logEq(props, nextProps, "scrollLeft", (x, y) => x === y)
      || !logEq(props, nextProps, "width", (x, y) => x === y)
      || !logEq(props, nextProps, "transform", (x, y) => x && y && x.equals(y))
  }

  render() {
    return <PianoNotes {...this.props} />
  }
}

export default mouseablePianoNotes(_PianoNotes)
