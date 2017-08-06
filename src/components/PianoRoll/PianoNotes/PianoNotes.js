/**
  ノートイベントを描画するコンポーネント
*/

import React, { Component } from "react"
import PropTypes from "prop-types"
import _ from "lodash"
import DrawCanvas from "../../DrawCanvas"
import logEq from "../../../helpers/logEq"
import filterEventsWithScroll from "../../../helpers/filterEventsWithScroll"
import SelectionMouseHandler from "./SelectionMouseHandler"
import PencilMouseHandler from "./PencilMouseHandler"

/**

  [{ id, x, y, width, height, selected, velocity }, ...]

*/
export function filterEvents(events, transform, scrollLeft, width) {
  return filterEventsWithScroll(events, transform.pixelsPerTick, scrollLeft, width)
    .filter(e => e.subtype === "note")
    .map(note => {
      const rect = transform.getRect(note)
      return {
        id: note.id,
        velocity: note.velocity,
        selected: note.selected,
        ...rect,
      }
    })
}

function colorStr({ r, g, b }, alpha = 1) {
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function drawNote(ctx, { x, y, width, height, selected, velocity }, color, selectedColor) {
  const alpha = velocity / 127
  const noteColor = selected ? colorStr(selectedColor) : colorStr(color, alpha)

  x = Math.round(x)
  y = Math.round(y)
  width = Math.round(width - 1) // 次のノートと被らないように小さくする
  height = Math.round(height)

  ctx.beginPath()
  ctx.fillStyle = noteColor
  ctx.strokeStyle = "rgba(0, 0, 0, 1)"
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

function PianoNotes({
  events,
  transform,
  width,
  scrollLeft,
  mouseMode,
  dispatch,
  cursor,
  pencilMouseHandler,
  selectionMouseHandler
}) {
  const items = filterEvents(events, transform, scrollLeft, width)
  const height = transform.pixelsPerKey * transform.numberOfKeys

  // ローカル座標や、どの item の上でクリックされたかなどの追加情報を作成する
  function eventOption(e) {
    function getLocal(e) {
      return {
        x: e.nativeEvent.offsetX + scrollLeft,
        y: e.nativeEvent.offsetY
      }
    }

    function positionType(local, item) {
      const localX = local.x - item.x
      const edgeSize = Math.min(item.width / 3, 8)
      if (localX <= edgeSize) { return "left" }
      if (item.width - localX <= edgeSize) { return "right" }
      return "center"
    }

    function itemUnderPoint({ x, y }) {
      return items
        .filter(b => {
          return x >= b.x
            && x <= b.x + b.width
            && y >= b.y
            && y <= b.y + b.height
        })[0]
    }

    const local = getLocal(e)
    const item = itemUnderPoint(local)
    const position = item && positionType(local, item)
    const tick = transform.getTicks(local.x)
    const noteNumber = Math.round(transform.getNoteNumber(local.y))
    return {
      local, item, position, tick, noteNumber
    }
  }

  const extendEvent = func => e => func({
    ...e,
    ...eventOption(e)
  })

  const color = { r: 60, g: 87, b: 221 }
  const selectedColor = { r: 45, g: 57, b: 115 }

  function draw(ctx) {
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)

    ctx.save()
    ctx.translate(0.5 - Math.round(scrollLeft), 0.5)
    items.forEach(item => drawNote(ctx, item, color, selectedColor))
    ctx.restore()
  }

  const noteMouseHandler = mouseMode === 0 ?
    pencilMouseHandler : selectionMouseHandler
  noteMouseHandler.dispatch = dispatch

  return <DrawCanvas
    draw={draw}
    className="PianoNotes"
    width={width}
    height={height}
    onContextMenu={e => e.preventDefault()}
    onMouseDown={extendEvent(e => noteMouseHandler.onMouseDown(e))}
    onMouseMove={extendEvent(e => noteMouseHandler.onMouseMove(e))}
    onMouseUp={extendEvent(e => noteMouseHandler.onMouseUp(e))}
    style={{ cursor }}
  />
}

PianoNotes.propTypes = {
  events: PropTypes.array.isRequired,
  width: PropTypes.number.isRequired,
  scrollLeft: PropTypes.number.isRequired,
  cursor: PropTypes.string
}

class _PianoNotes extends Component {
  constructor(props) {
    super(props)

    this.state = {
      pencilMouseHandler: new PencilMouseHandler(),
      selectionMouseHandler: new SelectionMouseHandler()
    }
  }

  shouldComponentUpdate(nextProps) {
    const props = this.props
    return !logEq(props, nextProps, "events", _.isEqual)
      || !logEq(props, nextProps, "transform")
      || !logEq(props, nextProps, "scrollLeft")
      || !logEq(props, nextProps, "width")
      || !logEq(props, nextProps, "cursor")
  }

  render() {
    this.state.pencilMouseHandler.transform = this.props.transform

    return <PianoNotes {...this.props} {...this.state} />
  }
}

export default _PianoNotes
