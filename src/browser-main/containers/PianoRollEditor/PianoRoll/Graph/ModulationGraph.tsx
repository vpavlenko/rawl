import React, { StatelessComponent } from "react"
import { pure, Omit } from "recompose"
import LineGraphControl, { LineGraphControlProps, LineGraphControlEvent } from "./LineGraphControl"
import { Dispatcher } from "browser-main/createDispatcher";
import { CREATE_MODULATION } from "browser-main/actions";

interface Event extends LineGraphControlEvent {
  controllerType?: number
}

export type ModulationGraphProps = Omit<LineGraphControlProps, 
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

const ModulationGraph: StatelessComponent<ModulationGraphProps> = ({
  width,
  height,
  scrollLeft,
  events,
  transform,
  dispatch,
  color
}) => {
  return <LineGraphControl
    className="ModulationGraph"
    width={width}
    height={height}
    scrollLeft={scrollLeft}
    transform={transform}
    maxValue={127}
    events={events.filter(e => e.controllerType === 0x01)}
    axis={[0, 0x20, 0x40, 0x60, 0x80 - 1]}
    createEvent={obj => dispatch(CREATE_MODULATION, obj)}
    onClickAxis={value => dispatch(CREATE_MODULATION, { value })}
    color={color}
  />
}

export default pure(ModulationGraph)
