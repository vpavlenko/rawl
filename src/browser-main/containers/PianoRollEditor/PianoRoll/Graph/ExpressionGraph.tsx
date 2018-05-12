import React, { StatelessComponent } from "react"
import { pure, Omit } from "recompose"
import LineGraphControl, { LineGraphControlProps, LineGraphControlEvent } from "./LineGraphControl"
import { Dispatcher } from "browser-main/createDispatcher";

interface Event extends LineGraphControlEvent {
  controllerType?: number
}

export type ExpressionGraphProps = Omit<LineGraphControlProps, 
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

const ExpressionGraph: StatelessComponent<ExpressionGraphProps> = ({
  width,
  height,
  scrollLeft,
  events,
  transform,
  dispatch,
  color
}) => {
  return <LineGraphControl
    className="ExpressionGraph"
    width={width}
    height={height}
    scrollLeft={scrollLeft}
    transform={transform}
    maxValue={127}
    events={events.filter(e => e.controllerType === 0x0b)}
    axis={[0, 0x20, 0x40, 0x60, 0x80 - 1]}
    createEvent={obj => dispatch("CREATE_EXPRESSION", obj)}
    onClickAxis={value => dispatch("CREATE_EXPRESSION", { value })}
    color={color}
  />
}

export default pure(ExpressionGraph)
