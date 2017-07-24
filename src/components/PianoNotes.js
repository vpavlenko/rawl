/**
  ノートイベントを描画するコンポーネント
  表示だけを行い、Transform や Quantizer, Track に依存しない
*/

import React, { Component } from "react"
import PropTypes from "prop-types"
import _ from "lodash"
import DrawCanvas from "./DrawCanvas"
import logEq from "../helpers/logEq"
import filterEventsWithScroll from "../helpers/filterEventsWithScroll"

/**

  [{ id, x, y, width, height, selected, velocity }, ...]

*/
export function filterEvents(events, transform, scrollLeft, width) {
  return filterEventsWithScroll(events, transform, scrollLeft, width)
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

const Color = {
  Black: {
    r: 0, g: 0, b: 0
  },
  White: {
    r: 255, g: 255, b: 255
  },
  Blue: {
    r: 0, g: 0, b: 255
  }
}

const Style = {
  color: Color.Blue,
  selectedColor: Color.Black,
  borderColor: Color.Black,
  highlightColor: Color.White
}

function drawNote(ctx, { x, y, width, height, selected, velocity }, { color, selectedColor, borderColor, highlightColor }) {
  const alpha = velocity / 127
  const noteColor = selected ? colorStr(selectedColor) : colorStr(color, alpha)

  x = Math.round(x)
  y = Math.round(y)
  width = Math.round(width - 1) // 次のノートと被らないように小さくする
  height = Math.round(height)

  ctx.beginPath()
  ctx.fillStyle = noteColor
  ctx.strokeStyle = colorStr(borderColor)
  ctx.lineWidth = 1
  ctx.rect(x, y, width, height)
  ctx.fill()
  ctx.stroke()

  // draw highlight
  ctx.beginPath()
  ctx.strokeStyle = colorStr(highlightColor, 0.3)
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
  onMouseDown,
  onMouseMove,
  onMouseUp,
  cursor
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
    return {
      local, item, position
    }
  }

  const extendEvent = func => e => func({
    ...e,
    ...eventOption(e)
  })

  function draw(ctx) {
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)

    ctx.save()
    ctx.translate(0.5 - Math.round(scrollLeft), 0.5)
    items.forEach(item => drawNote(ctx, item, Style))
    ctx.restore()
  }

  return <DrawCanvas
    draw={draw}
    className="PianoNotes"
    width={width}
    height={height}
    onContextMenu={e => e.preventDefault()}
    onMouseDown={extendEvent(onMouseDown)}
    onMouseMove={extendEvent(onMouseMove)}
    onMouseUp={extendEvent(onMouseUp)}
    style={{ cursor }}
  />
}

PianoNotes.propTypes = {
  events: PropTypes.array.isRequired,
  width: PropTypes.number.isRequired,
  scrollLeft: PropTypes.number.isRequired,
  cursor: PropTypes.string,
  onMouseDown: PropTypes.func,
  onMouseMove: PropTypes.func,
  onMouseUp: PropTypes.func
}

class _PianoNotes extends Component {
  shouldComponentUpdate(nextProps) {
    const props = this.props
    return !logEq(props, nextProps, "events", _.isEqual)
      || !logEq(props, nextProps, "transform")
      || !logEq(props, nextProps, "scrollLeft")
      || !logEq(props, nextProps, "width")
      || !logEq(props, nextProps, "cursor")
      || !logEq(props, nextProps, "onMouseDown")
      || !logEq(props, nextProps, "onMouseMove")
      || !logEq(props, nextProps, "onMouseUp")
  }

  render() {
    return <PianoNotes {...this.props} />
  }
}

export default _PianoNotes
