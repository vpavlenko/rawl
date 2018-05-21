import React, { StatelessComponent } from "react"
import { pure, Omit } from "recompose"
import LineGraphControl, { LineGraphControlProps, LineGraphControlEvent } from "./LineGraphControl"
import { Dispatcher } from "browser-main/createDispatcher";
import { CREATE_VOLUME } from "browser-main/actions";
import { ControllerEvent } from "midifile-ts"
import { TrackEvent } from "common/track"

export type VolumeGraphProps = Omit<LineGraphControlProps, 
  "createEvent" |
  "onClickAxis" |
  "maxValue" |
  "className" |
  "axis" |
  "events"
> & {
  events: TrackEvent[]
  dispatch: Dispatcher
}

const VolumeGraph: StatelessComponent<VolumeGraphProps> = ({
  width,
  height,
  scrollLeft,
  events,
  transform,
  dispatch,
  color
}) => {
  const filteredEvents = events.filter(e => (e as any).controllerType === 0x07) as (LineGraphControlEvent & ControllerEvent)[]
  
  return <LineGraphControl
    className="VolumeGraph"
    width={width}
    height={height}
    scrollLeft={scrollLeft}
    transform={transform}
    maxValue={127}
    events={filteredEvents}
    axis={[0, 0x20, 0x40, 0x60, 0x80 - 1]}
    createEvent={obj => dispatch(CREATE_VOLUME, obj)}
    onClickAxis={value => dispatch(CREATE_VOLUME, { value })}
    color={color}
  />
}

export default pure(VolumeGraph)
