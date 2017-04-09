/**
  ノートイベントを描画するコンポーネント
  表示だけを行い、Transform や Quantizer, Track に依存しない
*/

import React, { Component, PropTypes } from "react"
import _ from "lodash"
import DrawCanvas from "./DrawCanvas"
import logEq from "../helpers/logEq"

function drawNote(ctx, { x, y, width, height, selected, velocity }) {
  const alpha = velocity / 127
  const color = selected ? "black" : `rgba(0, 0, 255, ${alpha})`

  x = Math.round(x)
  y = Math.round(y)
  width = Math.round(width)
  height = Math.round(height)

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

function PianoNotes({
  items,
  width,
  height,
  scrollLeft,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  cursor
}) {
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

  const _onMouseDown = e =>
    onMouseDown({
      ...e,
      ...eventOption(e)
    })

  const _onMouseMove = e =>
    onMouseMove({
      ...e,
      ...eventOption(e)
    })

  const _onMouseUp = e =>
    onMouseUp({
      ...e,
      ...eventOption(e)
    })

  function draw(ctx) {
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)

    ctx.save()
    ctx.translate(0.5 - Math.round(scrollLeft), 0.5)
    items.forEach(item => drawNote(ctx, item))
    ctx.restore()
  }

  return <DrawCanvas
    draw={draw}
    className="PianoNotes"
    width={width}
    height={height}
    onContextMenu={e => e.preventDefault()}
    onMouseDown={_onMouseDown}
    onMouseMove={_onMouseMove}
    onMouseUp={_onMouseUp}
    style={{ cursor }}
  />
}

PianoNotes.propTypes = {
  items: PropTypes.array.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  scrollLeft: PropTypes.number.isRequired,
  cursor: PropTypes.string,
  onMouseDown: PropTypes.func,
  onMouseMove: PropTypes.func,
  onMouseUp: PropTypes.func
}

class _PianoNotes extends Component {
  shouldComponentUpdate(nextProps) {
    const props = this.props
    return !logEq(props, nextProps, "items", _.isEqual)
      || !logEq(props, nextProps, "scrollLeft")
      || !logEq(props, nextProps, "width")
      || !logEq(props, nextProps, "height")
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
