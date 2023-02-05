import { observer } from "mobx-react-lite"
import React, { FC } from "react"
import { ISize } from "../../../../common/geometry"
import { useStores } from "../../../hooks/useStores"
import LineGraphControl from "../LineGraph/LineGraph"

export type PitchGraphProps = ISize

const PitchGraph: FC<PitchGraphProps> = observer(({ width, height }) => {
  const {
    pianoRollStore: { pitchBendEvents: events },
  } = useStores()

  return (
    <LineGraphControl
      width={width}
      height={height}
      maxValue={0x4000}
      events={events}
      axis={[0, 0x1000, 0x2000, 0x3000, 0x4000 - 1]}
      axisLabelFormatter={(v) => (v - 0x2000).toString()}
      eventType={{ type: "pitchBend" }}
    />
  )
})

export default React.memo(PitchGraph)
