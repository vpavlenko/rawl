import React from "react"
import LineGraphControl from "./LineGraphControl"

export default function PitchGraph({
  width,
  height,
  scrollLeft,
  events,
  transform,
  dispatch
}) {
  return <LineGraphControl
    className="PitchGraph"
    width={width}
    height={height}
    scrollLeft={scrollLeft}
    transform={transform}
    maxValue={127}
    lineWidth={2}
    events={events.filter(e => e.controllerType === 0x0a)}
    axis={[-0x40, -0x20, 0, 0x20, 0x40 - 1]}
    createEvent={obj => dispatch("CREATE_PAN", obj)}
    onClickAxis={e => dispatch("CREATE_PAN", { value: e.value + 0x40 })}
  />
}
