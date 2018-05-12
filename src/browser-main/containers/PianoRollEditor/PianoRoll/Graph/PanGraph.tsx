import React, { StatelessComponent } from "react"
import { pure, Omit } from "recompose"
import LineGraphControl, { LineGraphControlProps, LineGraphControlEvent } from "./LineGraphControl"
import { Dispatcher } from "browser-main/createDispatcher";
import { CREATE_PAN } from "browser-main/actions";

interface Event extends LineGraphControlEvent {
  controllerType?: number
}

export type PanGraphProps = Omit<LineGraphControlProps, 
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

const PanGraph: StatelessComponent<PanGraphProps> = ({
  width,
  height,
  scrollLeft,
  events,
  transform,
  dispatch,
  color
}) => {
  return <LineGraphControl
    className="PanGraph"
    width={width}
    height={height}
    scrollLeft={scrollLeft}
    transform={transform}
    maxValue={127}
    events={events.filter(e => e.controllerType === 0x0a)}
    axis={[-0x40, -0x20, 0, 0x20, 0x40 - 1]}
    createEvent={obj => dispatch(CREATE_PAN, obj)}
    onClickAxis={value => dispatch(CREATE_PAN, { value: value + 0x40 })}
    color={color}
  />
}

export default pure(PanGraph)
