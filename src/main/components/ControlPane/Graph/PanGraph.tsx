import { MIDIControlEvents } from "midifile-ts"
import { observer } from "mobx-react-lite"
import React, { FC } from "react"
import { ISize } from "../../../../common/geometry"
import { useStores } from "../../../hooks/useStores"
import LineGraphControl from "../LineGraph/LineGraph"

export type PanGraphProps = ISize

const PanGraph: FC<PanGraphProps> = observer(({ width, height }) => {
  const rootStore = useStores()
  const events = rootStore.pianoRollStore.panEvents

  return (
    <LineGraphControl
      width={width}
      height={height}
      maxValue={127}
      events={events}
      axis={[0, 0x20, 0x40, 0x60, 0x80 - 1]}
      axisLabelFormatter={(v) => (v - 0x40).toString()}
      eventType={{
        type: "controller",
        controllerType: MIDIControlEvents.MSB_PAN,
      }}
    />
  )
})

export default React.memo(PanGraph)
