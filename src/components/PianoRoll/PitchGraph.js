import React from "react"
import LineGraph from "./LineGraph"

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

function PitchGraph({
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
      // insert new pitchbend event
      const obj = transformFromPosition(e.local, transform, height)
      dispatch("CREATE_PITCH_BEND", obj)
      return
    }
  }

  const onClickAxis = e => {
    dispatch("CREATE_PITCH_BEND", { value: e.value + 0x2000 })
  }

  return <LineGraph
    className="PitchGraph"
    width={width}
    height={height}
    onMouseDown={onMouseDown}
    items={items}
    scrollLeft={scrollLeft}
    lineWidth={LINE_WIDTH}
    axis={[-0x2000, -0x1000, 0, 0x1000, 0x2000 - 1]}
    onClickAxis={onClickAxis}
  />
}

export default PitchGraph
