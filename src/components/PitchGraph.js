import React, { Component } from "react"
import _ from "lodash"
import DrawCanvas from "./DrawCanvas"

function drawEvents(ctx, strokeColor, items, center, right) {
  ctx.beginPath()
  ctx.strokeStyle = strokeColor
  ctx.lineWidth = 2
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
  items,
  onMouseDown,
  onMouseMove,
  onMouseUp
}) {
  function draw(ctx) {
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)

    const strokeColor = "blue"

    ctx.save()
    ctx.translate(-Math.round(scrollLeft), 0)
    drawEvents(ctx, strokeColor, items, height / 2, scrollLeft + width)
    ctx.restore()
  }

  function eventOption(e) {
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
    const local = getLocal(e)

    return {
      local,
      items: itemsUnderPoint(local)
    }
  }

  const extendEvent = func => e => func({
    ...e,
    ...eventOption(e)
  })

  return <DrawCanvas
    className="PianoControl PitchGraph"
    draw={draw}
    width={width}
    height={height}
    onMouseDown={extendEvent(onMouseDown)}
    onMouseMove={extendEvent(onMouseMove)}
    onMouseUp={extendEvent(onMouseUp)}
  />
}

export default PitchGraph
