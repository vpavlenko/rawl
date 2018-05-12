import React, { StatelessComponent } from "react"
import { pure, Omit } from "recompose"
import LineGraphControl, { LineGraphControlProps, LineGraphControlEvent } from "./LineGraphControl"
import { Dispatcher } from "browser-main/createDispatcher";
import { CREATE_PITCH_BEND } from "browser-main/actions";

interface Event extends LineGraphControlEvent {
  subtype?: string
}

export type PitchGraphProps = Omit<LineGraphControlProps, 
  "createEvent" |
  "onClickAxis" |
  "maxValue" |
  "className" |
  "axis" | 
  "events"
> & {
  events: Event[]
  dispatch: Dispatcher
}

const PitchGraph: StatelessComponent<PitchGraphProps> = ({
  width,
  height,
  scrollLeft,
  events,
  transform,
  dispatch,
  color
}) => {
  return <LineGraphControl
    className="PitchGraph"
    width={width}
    height={height}
    scrollLeft={scrollLeft}
    transform={transform}
    maxValue={0x4000}
    events={events.filter(e => e.subtype === "pitchBend")}
    axis={[-0x2000, -0x1000, 0, 0x1000, 0x2000 - 1]}
    createEvent={obj => dispatch(CREATE_PITCH_BEND, obj)}
    onClickAxis={value => dispatch(CREATE_PITCH_BEND, { value: value + 0x2000 })}
    color={color}
  />
}

export default pure(PitchGraph)
