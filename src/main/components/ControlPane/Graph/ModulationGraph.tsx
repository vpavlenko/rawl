import { observer } from "mobx-react-lite"
import React, { FC } from "react"
import { ISize } from "../../../../common/geometry"
import { modulationMidiEvent } from "../../../../common/midi/MidiEvent"
import { useStores } from "../../../hooks/useStores"
import LineGraphControl from "./LineGraphControl"

export type ModulationGraphProps = ISize

const ModulationGraph: FC<ModulationGraphProps> = observer(
  ({ width, height }) => {
    const rootStore = useStores()
    const events = rootStore.pianoRollStore.modulationEvents

    return (
      <LineGraphControl
        width={width}
        height={height}
        maxValue={127}
        events={events}
        axis={[0, 0x20, 0x40, 0x60, 0x80 - 1]}
        createEvent={(value) => modulationMidiEvent(0, 0, Math.round(value))}
      />
    )
  }
)

export default React.memo(ModulationGraph)
