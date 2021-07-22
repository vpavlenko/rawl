import { observer } from "mobx-react-lite"
import React, { FC } from "react"
import { ISize } from "../../../../common/geometry"
import { panMidiEvent } from "../../../../common/midi/MidiEvent"
import { isPanEvent } from "../../../../common/track"
import { useStores } from "../../../hooks/useStores"
import LineGraphControl from "./LineGraphControl"

export type PanGraphProps = ISize

const PanGraph: FC<PanGraphProps> = observer(({ width, height }) => {
  const rootStore = useStores()
  const events = rootStore.pianoRollStore.controllerEvents.filter(isPanEvent)

  return (
    <LineGraphControl
      width={width}
      height={height}
      maxValue={127}
      events={events}
      axis={[0, 0x20, 0x40, 0x60, 0x80 - 1]}
      axisLabelFormatter={(v) => (v - 0x40).toString()}
      createEvent={(value) => panMidiEvent(0, 0, Math.round(value))}
    />
  )
})

export default React.memo(PanGraph)
