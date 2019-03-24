import React, { StatelessComponent } from "react"
import { pure, Omit } from "recompose"
import { PitchBendEvent } from "@signal-app/midifile-ts"
import LineGraphControl, {
  LineGraphControlProps,
  LineGraphControlEvent
} from "./LineGraphControl"
import { Dispatcher } from "main/createDispatcher"
import { CREATE_PITCH_BEND } from "main/actions"
import { TrackEvent } from "common/track"

export type PitchGraphProps = Omit<
  LineGraphControlProps,
  "createEvent" | "onClickAxis" | "maxValue" | "className" | "axis" | "events"
> & {
  events: TrackEvent[]
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
  const filteredEvents = events.filter(
    e => (e as any).subtype === "pitchBend"
  ) as (LineGraphControlEvent & PitchBendEvent)[]

  return (
    <LineGraphControl
      className="PitchGraph"
      width={width}
      height={height}
      scrollLeft={scrollLeft}
      transform={transform}
      maxValue={0x4000}
      events={filteredEvents}
      axis={[-0x2000, -0x1000, 0, 0x1000, 0x2000 - 1]}
      createEvent={obj => dispatch(CREATE_PITCH_BEND, obj.value, obj.tick)}
      onClickAxis={value => dispatch(CREATE_PITCH_BEND, value + 0x2000)}
      color={color}
    />
  )
}

export default pure(PitchGraph)
