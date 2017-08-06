import React from "react"
import LineGraphControl from "./LineGraphControl"

export default function PitchGraph({
  width,
  height,
  scrollLeft,
  events,
  transform,
  dispatch,
  color
}) {
  return <LineGraphControl
    className="PitchGraph"
    width={width}
    height={height}
    scrollLeft={scrollLeft}
    transform={transform}
    maxValue={0x4000}
    lineWidth={2}
    events={events.filter(e => e.subtype === "pitchBend")}
    axis={[-0x2000, -0x1000, 0, 0x1000, 0x2000 - 1]}
    createEvent={obj => dispatch("CREATE_PITCH_BEND", obj)}
    onClickAxis={e => dispatch("CREATE_PITCH_BEND", { value: e.value + 0x2000 })}
    color={color}
  />
}
