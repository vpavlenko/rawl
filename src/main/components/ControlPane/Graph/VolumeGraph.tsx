import { ControllerEvent } from "midifile-ts"
import React, { FC } from "react"
import { TrackEvent } from "../../../../common/track"
import LineGraphControl, {
  LineGraphControlEvent,
  LineGraphControlProps,
} from "./LineGraphControl"

export type VolumeGraphProps = Omit<
  LineGraphControlProps,
  "createEvent" | "onClickAxis" | "maxValue" | "className" | "axis" | "events"
> & {
  events: TrackEvent[]
  createEvent: (value: number, tick?: number) => void
}

const VolumeGraph: FC<VolumeGraphProps> = ({
  width,
  height,
  events,
  createEvent,
}) => {
  const filteredEvents = events.filter(
    (e) => (e as any).controllerType === 0x07
  ) as (LineGraphControlEvent & ControllerEvent)[]

  return (
    <LineGraphControl
      className="VolumeGraph"
      width={width}
      height={height}
      maxValue={127}
      events={filteredEvents}
      axis={[0, 0x20, 0x40, 0x60, 0x80 - 1]}
      createEvent={(obj) => createEvent(obj.value, obj.tick)}
      onClickAxis={(value) => createEvent(value)}
    />
  )
}

export default React.memo(VolumeGraph)
