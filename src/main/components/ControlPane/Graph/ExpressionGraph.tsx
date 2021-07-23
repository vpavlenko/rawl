import { observer } from "mobx-react-lite"
import React, { FC } from "react"
import { ISize } from "../../../../common/geometry"
import { expressionMidiEvent } from "../../../../common/midi/MidiEvent"
import { useStores } from "../../../hooks/useStores"
import LineGraphControl from "./LineGraphControl"

export type ExpressionGraphProps = ISize

const ExpressionGraph: FC<ExpressionGraphProps> = observer(
  ({ width, height }) => {
    const rootStore = useStores()
    const events = rootStore.pianoRollStore.expressionEvents

    return (
      <LineGraphControl
        width={width}
        height={height}
        maxValue={127}
        events={events}
        axis={[0, 0x20, 0x40, 0x60, 0x80 - 1]}
        createEvent={(value) => expressionMidiEvent(0, 0, Math.round(value))}
      />
    )
  }
)

export default React.memo(ExpressionGraph)
