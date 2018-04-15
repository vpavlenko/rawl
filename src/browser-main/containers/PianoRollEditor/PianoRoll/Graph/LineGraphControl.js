import React from "react"
import { pure } from "recompose"
import LineGraph from "./LineGraph"

function LineGraphControl({
  className,
  width,
  height,
  scrollLeft,
  events,
  transform,
  lineWidth = 1,
  maxValue,
  createEvent,
  axis,
  onClickAxis,
  color
}) {
  function transformEvents(events, transform, height) {
    return events
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
      y: Math.round((1 - value / maxValue) * (height - lineWidth * 2)) + lineWidth
    }
  }

  function transformFromPosition(position, transform, height) {
    return {
      tick: transform.getTicks(position.x),
      value: (1 - (position.y - lineWidth) / (height - lineWidth * 2)) * maxValue
    }
  }

  const items = transformEvents(events, transform, height)

  const onMouseDown = e => {
    createEvent(transformFromPosition(e.local, transform, height))
  }

  return <LineGraph
    className={className}
    width={width}
    height={height}
    onMouseDown={onMouseDown}
    items={items}
    scrollLeft={scrollLeft}
    lineWidth={lineWidth}
    axis={axis}
    onClickAxis={onClickAxis}
    color={color}
  />
}

export default pure(LineGraphControl)
