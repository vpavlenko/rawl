import React from "react"
import _ from "lodash"
import DrawCanvas from "../../DrawCanvas"

const LINE_WIDTH = 2

function transformEvents(events, transform, height) {
  return events
    .filter(e => e.subtype === "pitchBend")
    .map(e => {
      return {
        id: e.id,
        ...transformToPosition(e.tick, e.value, transform, height)
      }
    })
}

function transformToPosition(tick, value, transform, height) {
  return {
    x: Math.round(transform.getX(tick)),
    y: Math.round((1 - value / 0x4000) * (height - LINE_WIDTH * 2)) + LINE_WIDTH
  }
}

function transformFromPosition(position, transform, height) {
  return {
    tick: transform.getTicks(position.x),
    value: (1 - (position.y - LINE_WIDTH) / (height - LINE_WIDTH * 2)) * 0x4000
  }
}

function drawEvents(ctx, strokeColor, items, center, right) {
  ctx.beginPath()
  ctx.strokeStyle = strokeColor
  ctx.lineWidth = LINE_WIDTH
  let prevY = center

  for (let item of items) {
    const x = Math.round(item.x)
    const y = Math.round(item.y)
    ctx.lineTo(x, prevY)
    ctx.lineTo(x, y)
    prevY = y

    // 最後は右端まで線を引く
    if (item === _.last(items)) {
      ctx.lineTo(right, y)
    }
  }

  ctx.stroke()
}

function PitchGraph({
  width,
  height,
  scrollLeft,
  events,
  transform,
  dispatch
}) {
  const items = transformEvents(events, transform, height)

  function draw(ctx) {
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)

    const strokeColor = "blue"

    ctx.save()
    ctx.translate(-Math.round(scrollLeft), 0)
    drawEvents(ctx, strokeColor, items, height / 2, scrollLeft + width)
    ctx.restore()
  }

  function getLocal(e) {
    return {
      x: Math.round(e.nativeEvent.offsetX + scrollLeft),
      y: e.nativeEvent.offsetY
    }
  }

  function itemsUnderPoint({ x }) {
    return items
      .filter(b => {
        return x === Math.round(b.x)
      })
  }

  const onMouseDown = e => {
    const local = getLocal(e)
    const items = itemsUnderPoint(local)

    if (items.length === 0) {
      // insert new pitchbend event
      const obj = transformFromPosition(local, transform, height)
      dispatch("CREATE_PITCH_BEND", obj)
      return
    }
  }

  return <DrawCanvas
    className="PianoControl PitchGraph"
    draw={draw}
    width={width}
    height={height}
    onMouseDown={onMouseDown}
  />
}

export default PitchGraph
