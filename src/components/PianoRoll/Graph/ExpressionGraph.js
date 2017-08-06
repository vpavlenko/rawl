import React from "react"
import LineGraphControl from "./LineGraphControl"

export default function ExpressionGraph({
  width,
  height,
  scrollLeft,
  events,
  transform,
  dispatch,
  color
}) {
  return <LineGraphControl
    className="ExpressionGraph"
    width={width}
    height={height}
    scrollLeft={scrollLeft}
    transform={transform}
    maxValue={127}
    lineWidth={2}
    events={events.filter(e => e.controllerType === 0x0b)}
    axis={[0, 0x20, 0x40, 0x60, 0x80 - 1]}
    createEvent={obj => dispatch("CREATE_EXPRESSION", obj)}
    onClickAxis={e => dispatch("CREATE_EXPRESSION", { value: e.value })}
    color={color}
  />
}
