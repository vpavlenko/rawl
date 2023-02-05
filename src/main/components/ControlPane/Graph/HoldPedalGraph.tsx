import { MIDIControlEvents } from "midifile-ts"
import { observer } from "mobx-react-lite"
import React, { FC } from "react"
import { ISize } from "../../../../common/geometry"
import { useStores } from "../../../hooks/useStores"
import LineGraphControl from "../LineGraph/LineGraph"

export type HoldPedalGraphProps = ISize

const HoldPedalGraph: FC<HoldPedalGraphProps> = observer(
  ({ width, height }) => {
    const {
      pianoRollStore: { sustainEvents: events },
    } = useStores()

    return (
      <LineGraphControl
        width={width}
        height={height}
        maxValue={127}
        events={events}
        axis={[0, 0x20, 0x40, 0x60, 0x80 - 1]}
        axisLabelFormatter={(v) => v.toString()}
        eventType={{
          type: "controller",
          controllerType: MIDIControlEvents.SUSTAIN,
        }}
      />
    )
  }
)

export default React.memo(HoldPedalGraph)
