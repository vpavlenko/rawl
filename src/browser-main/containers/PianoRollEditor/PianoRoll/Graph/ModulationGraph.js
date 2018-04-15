import React from "react"
import { pure } from "recompose"
import LineGraphControl from "./LineGraphControl"

function ModulationGraph({
  width,
  height,
  scrollLeft,
  events,
  transform,
  dispatch,
  color
}) {
  return <LineGraphControl
    className="ModulationGraph"
    width={width}
    height={height}
    scrollLeft={scrollLeft}
    transform={transform}
    maxValue={127}
    events={events.filter(e => e.controllerType === 0x01)}
    axis={[0, 0x20, 0x40, 0x60, 0x80 - 1]}
    createEvent={obj => dispatch("CREATE_MODULATION", obj)}
    onClickAxis={e => dispatch("CREATE_MODULATION", { value: e.value })}
    color={color}
  />
}

export default pure(ModulationGraph)
