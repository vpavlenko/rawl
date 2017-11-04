import React from "react"
import _ from "lodash"
import { pure } from "recompose"

import DrawCanvas from "components/DrawCanvas"

import "./LineGraph.css"

function drawEvents(ctx, strokeColor, items, right, lineWidth) {
  ctx.beginPath()
  ctx.strokeStyle = strokeColor
  ctx.lineWidth = lineWidth
  let prevY

  for (let item of items) {
    const x = Math.round(item.x)
    const y = Math.round(item.y)
    if (prevY === undefined) {
      prevY = y
    }
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

function LineGraph({
  width,
  height,
  scrollLeft,
  items,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onClickAxis = () => { },
  className,
  lineWidth,
  axis,
  color
}) {
  function draw(ctx) {
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)

    ctx.save()
    ctx.translate(-Math.round(scrollLeft), 0)
    drawEvents(ctx, color, items, scrollLeft + width, lineWidth)
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
      <div className="values">
        {axis.reverse().map(value => <div
          key={value}
          className="AxisValue"
          onClick={e => onClickAxis({ ...e, value })}>
          {value}
        </div>)}
      </div>
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

export default pure(LineGraph)
