import React, { Component, PropTypes } from "react"
import _ from "lodash"
import DrawCanvas from "./DrawCanvas"
import mouseablePianoNotes from "../hocs/mouseablePianoNotes"
import logEq from "../helpers/logEq"

function drawNote(ctx, rect, note, fillColor) {
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
function PianoNotes({
  events,
  transform,
  width,
  style,
  mouseHandler,
  scrollLeft
}) {
  function draw(ctx) {
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)

    const notes = events.filter(e => e.subtype == "note")
    console.log(`[PianoNotes] draw ${notes.length} notes`)

    ctx.save()
    ctx.translate(-scrollLeft, 0.5)
    notes.forEach(note => {
      const rect = transform.getRect(note)
      drawNote(ctx, rect, note)
      mouseHandler.setEventBounds(note.id, _.assign({}, rect, note)) // TODO 単に rect を渡すようにして、 MouseActionController 側で track から取得させる
    })
    ctx.restore()
  }

  return <DrawCanvas
    draw={draw}
    className="PianoNotes"
    width={width}
    height={transform.pixelsPerKey * transform.numberOfKeys}
    style={style}
    onContextMenu={e => e.preventDefault()}
    {...mouseHandler}
  />
}

PianoNotes.propTypes = {
  width: PropTypes.number.isRequired,
  events: PropTypes.array.isRequired,
  transform: PropTypes.object.isRequired,
  scrollLeft: PropTypes.number.isRequired,
  mouseHandler: PropTypes.object.isRequired
}

class _PianoNotes extends Component {
  shouldComponentUpdate(nextProps) {
    const props = this.props
    return !logEq(props, nextProps, "events", _.isEqual)
      || !logEq(props, nextProps, "scrollLeft", (x, y) => x === y)
      || !logEq(props, nextProps, "width", (x, y) => x === y)
      || !logEq(props, nextProps, "transform", (x, y) => x && y && x.equals(y))
      || !logEq(props, nextProps, "style", _.isEqual)
  }

  render() {
    return <PianoNotes {...this.props} />
  }
}

export default mouseablePianoNotes(_PianoNotes)
