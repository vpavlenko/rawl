import { PitchBendEvent } from "midifile-ts"
import React, { FC } from "react"
import { TrackEvent } from "../../../../common/track"
import LineGraphControl, {
  LineGraphControlEvent,
  LineGraphControlProps,
} from "./LineGraphControl"

export type PitchGraphProps = Omit<
  LineGraphControlProps,
  "createEvent" | "onClickAxis" | "maxValue" | "className" | "axis" | "events"
> & {
  events: TrackEvent[]
  createEvent: (value: number, tick?: number) => void
}

const PitchGraph: FC<PitchGraphProps> = ({
  width,
  height,
  events,
  createEvent,
}) => {
  const filteredEvents = events.filter(
    (e) => (e as any).subtype === "pitchBend"
  ) as (LineGraphControlEvent & PitchBendEvent)[]

  return (
    <LineGraphControl
      width={width}
      height={height}
      maxValue={0x4000}
      events={filteredEvents}
      axis={[-0x2000, -0x1000, 0, 0x1000, 0x2000 - 1]}
      createEvent={(obj) => createEvent(obj.value, obj.tick)}
      onClickAxis={(value) => createEvent(value + 0x2000)}
    />
  )
}

export default React.memo(PitchGraph)
