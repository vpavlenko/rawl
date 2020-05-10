import React, { StatelessComponent } from "react"
import { Omit } from "recompose"
import LineGraphControl, {
  LineGraphControlProps,
  LineGraphControlEvent,
} from "./LineGraphControl"
import { ControllerEvent } from "midifile-ts"
import { TrackEvent } from "common/track"

export type VolumeGraphProps = Omit<
  LineGraphControlProps,
  "createEvent" | "onClickAxis" | "maxValue" | "className" | "axis" | "events"
> & {
  events: TrackEvent[]
  createEvent: (value: number, tick?: number) => void
}

const VolumeGraph: StatelessComponent<VolumeGraphProps> = ({
  width,
  height,
  scrollLeft,
  events,
  transform,
  createEvent,
  color,
}) => {
  const filteredEvents = events.filter(
    (e) => (e as any).controllerType === 0x07
  ) as (LineGraphControlEvent & ControllerEvent)[]

  return (
    <LineGraphControl
      className="VolumeGraph"
      width={width}
      height={height}
      scrollLeft={scrollLeft}
      transform={transform}
      maxValue={127}
      events={filteredEvents}
      axis={[0, 0x20, 0x40, 0x60, 0x80 - 1]}
      createEvent={(obj) => createEvent(obj.value, obj.tick)}
      onClickAxis={(value) => createEvent(value)}
      color={color}
    />
  )
}

export default React.memo(VolumeGraph)
