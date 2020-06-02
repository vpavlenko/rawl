import React, { StatelessComponent } from "react"

import Stage, { StageProps } from "components/Stage/Stage"
import LineGraphItem from "./LineGraphItem"
import { IPoint } from "common/geometry"
import { CanvasDrawStyle } from "main/style"

import "./LineGraph.css"

export interface LineGraphItemData extends IPoint {
  id: number
}

export type LineGraphProps = Omit<StageProps<LineGraphItem>, "items"> & {
  items: LineGraphItemData[]
  onClickAxis: (value: number) => void
  className: string
  lineWidth?: number
  axis: number[]
  color: CanvasDrawStyle
}

const LineGraph: StatelessComponent<LineGraphProps> = ({
  width,
  height,
  scrollLeft = 0,
  items,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onClickAxis,
  className,
  lineWidth = 1,
  axis,
  color,
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
          {axis.reverse().map((value) => (
            <div
              key={value}
              className="AxisValue"
              onClick={(e) => onClickAxis(value)}
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

export default React.memo(LineGraph)
