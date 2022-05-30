import { MIDIControlEvents } from "midifile-ts"
import { observer } from "mobx-react-lite"
import React, { FC } from "react"
import { ISize } from "../../../../common/geometry"
import { useStores } from "../../../hooks/useStores"
import LineGraphControl from "../LineGraph/LineGraph"

export type VolumeGraphProps = ISize

const VolumeGraph: FC<VolumeGraphProps> = observer(({ width, height }) => {
  const rootStore = useStores()
  const events = rootStore.pianoRollStore.volumeEvents

  return (
    <LineGraphControl
      width={width}
      height={height}
      maxValue={127}
      events={events}
      axis={[0, 0x20, 0x40, 0x60, 0x80 - 1]}
      eventType={{
        type: "controller",
        controllerType: MIDIControlEvents.MSB_MAIN_VOLUME,
      }}
    />
  )
})

export default React.memo(VolumeGraph)
