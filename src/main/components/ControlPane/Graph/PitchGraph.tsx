import { observer } from "mobx-react-lite"
import React, { FC } from "react"
import { ISize } from "../../../../common/geometry"
import { pitchBendMidiEvent } from "../../../../common/midi/MidiEvent"
import { useStores } from "../../../hooks/useStores"
import LineGraphControl from "./LineGraphControl"

export type PitchGraphProps = ISize

const PitchGraph: FC<PitchGraphProps> = observer(({ width, height }) => {
  const rootStore = useStores()
  const events = rootStore.pianoRollStore.pitchBendEvents

  return (
    <LineGraphControl
      width={width}
      height={height}
      maxValue={0x4000}
      events={events}
      axis={[0, 0x1000, 0x2000, 0x3000, 0x4000 - 1]}
      axisLabelFormatter={(v) => (v - 0x2000).toString()}
      createEvent={(value) => pitchBendMidiEvent(0, 0, Math.round(value))}
    />
  )
})

export default React.memo(PitchGraph)
