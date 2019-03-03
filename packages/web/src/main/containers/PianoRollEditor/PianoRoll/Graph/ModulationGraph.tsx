import React, { StatelessComponent } from "react"
import { pure, Omit } from "recompose"
import LineGraphControl, {
  LineGraphControlProps,
  LineGraphControlEvent
} from "./LineGraphControl"
import { Dispatcher } from "main/createDispatcher"
import { CREATE_MODULATION } from "main/actions"
import { ControllerEvent } from "@signal-app/midifile-ts"
import { TrackEvent } from "common/track"

export type ModulationGraphProps = Omit<
  LineGraphControlProps,
  "createEvent" | "onClickAxis" | "maxValue" | "className" | "axis" | "events"
> & {
  events: TrackEvent[]
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
  const filteredEvents = events.filter(
    e => (e as any).controllerType === 0x01
  ) as (LineGraphControlEvent & ControllerEvent)[]

  return (
    <LineGraphControl
      className="ModulationGraph"
      width={width}
      height={height}
      scrollLeft={scrollLeft}
      transform={transform}
      maxValue={127}
      events={filteredEvents}
      axis={[0, 0x20, 0x40, 0x60, 0x80 - 1]}
      createEvent={obj => dispatch(CREATE_MODULATION, obj)}
      onClickAxis={value => dispatch(CREATE_MODULATION, { value })}
      color={color}
    />
  )
}

export default pure(ModulationGraph)
