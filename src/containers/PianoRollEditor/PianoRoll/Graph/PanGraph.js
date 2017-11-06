import React from "react"
import { pure } from "recompose"
import LineGraphControl from "./LineGraphControl"

function PanGraph({
  width,
  height,
  scrollLeft,
  events,
  transform,
  dispatch,
  color
}) {
  return <LineGraphControl
    className="PanGraph"
    width={width}
    height={height}
    scrollLeft={scrollLeft}
    transform={transform}
    maxValue={127}
    events={events.filter(e => e.controllerType === 0x0a)}
    axis={[-0x40, -0x20, 0, 0x20, 0x40 - 1]}
    createEvent={obj => dispatch("CREATE_PAN", obj)}
    onClickAxis={e => dispatch("CREATE_PAN", { value: e.value + 0x40 })}
    color={color}
  />
}

export default pure(PanGraph)
