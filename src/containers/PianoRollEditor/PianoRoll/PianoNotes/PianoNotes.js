/**
  ノートイベントを描画するコンポーネント
*/

import React from "react"
import PropTypes from "prop-types"
import _ from "lodash"
import { shouldUpdate } from "recompose"

import Rect from "model/Rect"
import Item from "components/Stage/Item"
import Stage from "components/Stage/Stage"
import filterEventsWithScroll from "helpers/filterEventsWithScroll"

const COLOR = { r: 60, g: 87, b: 221 }
const SELECTED_COLOR = { r: 45, g: 57, b: 115 }

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

function drawNote(ctx, { x, y, width, height }, velocity, selected, color, selectedColor) {
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

function drawDrumNote(ctx, { x, y, height }, velocity, selected, color, selectedColor) {
  const alpha = velocity / 127
  const noteColor = selected ? colorStr(selectedColor) : colorStr(color, alpha)

  x = Math.round(x)
  y = Math.round(y)
  height = Math.round(height)
  const radius = Math.round(height / 2)

  ctx.beginPath()
  ctx.arc(x, y + radius, radius, 0, 2 * Math.PI)
  ctx.fillStyle = noteColor
  ctx.strokeStyle = "rgba(0, 0, 0, 1)"
  ctx.lineWidth = 1
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
}

class PianoNoteItem extends Item {
  constructor(id, x, y, width, height, velocity, isSelected, isDrum) {
    super()
    this.id = id
    this.bounds = new Rect(x, y, width, height)
    this.velocity = velocity
    this.isSelected = isSelected
    this.isDrum = isDrum
  }

  render(ctx) {
    if (this.isDrum) {
      drawDrumNote(ctx, this.bounds, this.velocity, this.isSelected, COLOR, SELECTED_COLOR)
    } else {
      drawNote(ctx, this.bounds, this.velocity, this.isSelected, COLOR, SELECTED_COLOR)
    }
  }
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
  const items = filterEvents(events, transform, scrollLeft, width).map(e => {
    const selected = selectedEventIds.includes(e.id)
    return new PianoNoteItem(e.id, e.x, e.y, e.width, e.height, e.velocity, selected, isDrumMode)
  })
  const height = transform.pixelsPerKey * transform.numberOfKeys

  // ローカル座標や、どの item の上でクリックされたかなどの追加情報を作成する
  function extendEvent(e) {
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

    const local = e.local
    const item = e.items[0]
    const position = item && positionType(local, item)
    const tick = transform.getTicks(local.x)
    const noteNumber = Math.ceil(transform.getNoteNumber(local.y))
    return {
      ...e, item, position, tick, noteNumber
    }
  }

  return <Stage
    items={items}
    className="PianoNotes"
    width={width}
    height={height}
    scrollLeft={scrollLeft}
    onContextMenu={e => e.preventDefault()}
    onMouseDown={e => mouseHandler.onMouseDown(extendEvent(e))}
    onMouseMove={e => mouseHandler.onMouseMove(extendEvent(e))}
    onMouseUp={e => mouseHandler.onMouseUp(extendEvent(e))}
    style={{ cursor }}
  />
}

PianoNotes.propTypes = {
  events: PropTypes.array.isRequired,
  width: PropTypes.number.isRequired,
  scrollLeft: PropTypes.number.isRequired,
  cursor: PropTypes.string
}

function test(props, nextProps) {
  const eq = (propName, compare = (a, b) => a === b) => {
    return compare(props[propName], nextProps[propName])
  }

  return !eq("events", _.isEqual)
    || !eq("transform")
    || !eq("scrollLeft")
    || !eq("width")
    || !eq("cursor")
    || !eq("selectedEventIds", _.isEqual)
}

export default shouldUpdate(test)(PianoNotes)
