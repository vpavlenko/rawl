import React from "react"
import { pure } from "recompose"

import Stage from "components/Stage/Stage"
import LineGraphItem from "./LineGraphItem.ts"

import "./LineGraph.css"

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
  const right = scrollLeft + width
  const items_ = items.map((item, i) => {
    const next = items[i + 1]
    const nextX = next ? next.x : right // 次がなければ右端まで描画する
    return new LineGraphItem(
      item.id, item.x, item.y, item.y,
      nextX - item.x,
      height, color, color, lineWidth)
  })

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
    <Stage
      className="Graph"
      items={items_}
      width={width}
      height={height}
      scrollLeft={scrollLeft}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    />
  </div>
}

export default pure(LineGraph)
