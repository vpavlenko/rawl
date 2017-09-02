/**
  ノートイベントを描画するコンポーネント
*/

import React, { Component } from "react"
import PropTypes from "prop-types"
import _ from "lodash"
import DrawCanvas from "../../DrawCanvas"
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
        ...rect,
      }
    })
}

function colorStr({ r, g, b }, alpha = 1) {
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function drawNote(ctx, { x, y, width, height, velocity }, selected, color, selectedColor) {
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

function drawDrumNote(ctx, { x, y, height, velocity }, selected, color, selectedColor) {
  const alpha = velocity / 127
  const noteColor = selected ? colorStr(selectedColor) : colorStr(color, alpha)

  x = Math.round(x)
  y = Math.round(y)
  height = Math.round(height)
  const radius = height / 2

  ctx.beginPath()
  ctx.arc(x, y + radius, radius, 0, 2 * Math.PI)
  ctx.fillStyle = noteColor
  ctx.strokeStyle = "rgba(0, 0, 0, 1)"
  ctx.lineWidth = 1
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
}

function PianoNotes({
  events,
  transform,
  width,
  scrollLeft,
  cursor,
  selectedEventIds,
  mouseHandler,
  isDrumMode
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
      if (isDrumMode) {
        return "center"
      }
      const localX = local.x - item.x
      const edgeSize = Math.min(item.width / 3, 8)
      if (localX <= edgeSize) { return "left" }
      if (item.width - localX <= edgeSize) { return "right" }
      return "center"
    }

    function itemUnderPoint({ x, y }) {
      if (isDrumMode) {
        return items
          .filter(b => {
            const r = b.height / 2
            return x >= b.x - r
              && x <= b.x + r
              && y >= b.y
              && y <= b.y + b.height
          })[0]
      }
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
    const noteNumber = Math.ceil(transform.getNoteNumber(local.y))
    return {
      local, item, position, tick, noteNumber
    }
  }

  const extendEvent = func => e => func && func({
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
    items.forEach(item => {
      const selected = selectedEventIds.includes(item.id)
      if (isDrumMode) {
        drawDrumNote(ctx, item, selected, color, selectedColor)
      } else {
        drawNote(ctx, item, selected, color, selectedColor)
      }
    })
    ctx.restore()
  }

  return <DrawCanvas
    draw={draw}
    className="PianoNotes"
    width={width}
    height={height}
    onContextMenu={e => e.preventDefault()}
    onMouseDown={extendEvent(e => mouseHandler.onMouseDown(e))}
    onMouseMove={extendEvent(e => mouseHandler.onMouseMove(e))}
    onMouseUp={extendEvent(e => mouseHandler.onMouseUp(e))}
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
    const eq = (propName, compare = (a, b) => a === b) => {
      return compare(this.props[propName], nextProps[propName])
    }

    return !eq("events", _.isEqual)
      || !eq("transform")
      || !eq("scrollLeft")
      || !eq("width")
      || !eq("cursor")
      || !eq("selectedEventIds", _.isEqual)
  }

  render() {
    this.state.pencilMouseHandler.transform = this.props.transform

    const mouseHandler = this.props.mouseMode === 0 ?
      this.state.pencilMouseHandler : this.state.selectionMouseHandler

    mouseHandler.dispatch = this.props.dispatch

    return <PianoNotes {...this.props} mouseHandler={mouseHandler} />
  }
}

export default _PianoNotes
