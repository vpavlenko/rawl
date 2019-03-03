import React, { StatelessComponent } from "react"
import { pure, Omit } from "recompose"

import Stage, { StageProps } from "components/Stage/Stage"
import LineGraphItem from "./LineGraphItem"
import { IPoint } from "common/geometry"

import "./LineGraph.css"

export interface LineGraphItemData extends IPoint {
  id: number
}

export type LineGraphProps = Omit<StageProps, "items"> & {
  items: LineGraphItemData[]
  onClickAxis: (value) => void
  className: string
  lineWidth?: number
  axis: number[]
  color: any
}

const LineGraph: StatelessComponent<LineGraphProps> = ({
  width,
  height,
  scrollLeft,
  items,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onClickAxis,
  className,
  lineWidth,
  axis,
  color
}) => {
  const right = scrollLeft + width
  const items_ = items.map(({ id, x, y }, i) => {
    const next = items[i + 1]
    const nextX = next ? next.x : right // 次がなければ右端まで描画する
    return new LineGraphItem(
      id,
      x,
      y,
      y,
      nextX - x,
      height,
      color,
      color,
      lineWidth
    )
  })

  return (
    <div className={`PianoControl LineGraph ${className}`}>
      <div className="GraphAxis">
        <div className="values">
          {axis.reverse().map(value => (
            <div
              key={value}
              className="AxisValue"
              onClick={e => onClickAxis(value)}
            >
              {value}
            </div>
          ))}
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
  )
}

LineGraph.defaultProps = {
  lineWidth: 1
}

export default pure(LineGraph)
