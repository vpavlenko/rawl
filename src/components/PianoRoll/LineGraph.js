import React from "react"
import _ from "lodash"
import DrawCanvas from "../DrawCanvas"

import "./LineGraph.css"

function drawEvents(ctx, strokeColor, items, center, right, lineWidth) {
  ctx.beginPath()
  ctx.strokeStyle = strokeColor
  ctx.lineWidth = lineWidth
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

export default function LineGraph({
  width,
  height,
  scrollLeft,
  items,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onClickAxis = () => {},
  className,
  lineWidth,
  axis
}) {
  function draw(ctx) {
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)

    const strokeColor = "blue"

    ctx.save()
    ctx.translate(-Math.round(scrollLeft), 0)
    drawEvents(ctx, strokeColor, items, height / 2, scrollLeft + width, lineWidth)
    ctx.restore()
  }

  function getLocal(e) {
    return {
      x: Math.round(e.nativeEvent.offsetX + scrollLeft),
      y: e.nativeEvent.offsetY
    }
  }

  const extend = func => e => func && func({ ...e, local: getLocal(e) })

  return <div className={`PianoControl LineGraph ${className}`}>
    <div className="GraphAxis">
      {axis.reverse().map(value => <div
        className="AxisValue"
        onClick={e => onClickAxis({ ...e, value })}>
        {value}
      </div>)}
    </div>
    <DrawCanvas
      className="Graph"
      draw={draw}
      width={width}
      height={height}
      onMouseDown={extend(onMouseDown)}
      onMouseMove={extend(onMouseMove)}
      onMouseUp={extend(onMouseUp)}
    />
  </div>
}
