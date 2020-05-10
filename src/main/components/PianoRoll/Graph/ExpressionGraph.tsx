import React, { StatelessComponent } from "react"
import { Omit } from "recompose"
import LineGraphControl, {
  LineGraphControlProps,
  LineGraphControlEvent,
} from "./LineGraphControl"
import { ControllerEvent } from "midifile-ts"
import { TrackEvent } from "common/track"

export type ExpressionGraphProps = Omit<
  LineGraphControlProps,
  "createEvent" | "onClickAxis" | "maxValue" | "className" | "axis" | "events"
> & {
  events: TrackEvent[]
  createEvent: (value: number, tick?: number) => void
}

const ExpressionGraph: StatelessComponent<ExpressionGraphProps> = ({
  width,
  height,
  scrollLeft,
  events,
  transform,
  createEvent,
  color,
}) => {
  const filteredEvents = events.filter(
    (e) => (e as any).controllerType === 0x0b
  ) as (LineGraphControlEvent & ControllerEvent)[]

  return (
    <LineGraphControl
      className="ExpressionGraph"
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

export default React.memo(ExpressionGraph)
