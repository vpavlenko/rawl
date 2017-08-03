import React from "react"
import LineGraph from "./LineGraph"

const LINE_WIDTH = 2
const MAX_VALUE = 127

function transformEvents(events, transform, height) {
  return events
    .filter(e => e.controllerType === 0x07)
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
    y: Math.round((1 - value / MAX_VALUE) * (height - LINE_WIDTH * 2)) + LINE_WIDTH
  }
}

function transformFromPosition(position, transform, height) {
  return {
    tick: transform.getTicks(position.x),
    value: (1 - (position.y - LINE_WIDTH) / (height - LINE_WIDTH * 2)) * MAX_VALUE
  }
}

function VolumeGraph({
  width,
  height,
  scrollLeft,
  events,
  transform,
  dispatch
}) {
  const items = transformEvents(events, transform, height)

  function itemsUnderPoint({ x }) {
    return items
      .filter(b => {
        return x === Math.round(b.x)
      })
  }

  const onMouseDown = e => {
    const items = itemsUnderPoint(e.local)

    if (items.length === 0) {
      const obj = transformFromPosition(e.local, transform, height)
      dispatch("CREATE_VOLUME", obj)
      return
    }
  }

  const onClickAxis = e => {
    dispatch("CREATE_VOLUME", { value: e.value })
  }

  return <LineGraph
    className="VolumeGraph"
    width={width}
    height={height}
    onMouseDown={onMouseDown}
    items={items}
    scrollLeft={scrollLeft}
    lineWidth={LINE_WIDTH}
    axis={[0, 0x20, 0x40, 0x60, 0x80 - 1]}
    onClickAxis={onClickAxis}
  />
}

export default VolumeGraph
