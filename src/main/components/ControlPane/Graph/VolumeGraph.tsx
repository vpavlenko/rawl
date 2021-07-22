import { observer } from "mobx-react-lite"
import React, { FC } from "react"
import { ISize } from "../../../../common/geometry"
import { isVolumeEvent } from "../../../../common/track"
import { createVolume } from "../../../actions"
import { useStores } from "../../../hooks/useStores"
import LineGraphControl from "./LineGraphControl"

export type VolumeGraphProps = ISize

const VolumeGraph: FC<VolumeGraphProps> = observer(({ width, height }) => {
  const rootStore = useStores()
  const createEvent = createVolume(rootStore)
  const events = rootStore.pianoRollStore.controllerEvents.filter(isVolumeEvent)

  return (
    <LineGraphControl
      width={width}
      height={height}
      maxValue={127}
      events={events}
      axis={[0, 0x20, 0x40, 0x60, 0x80 - 1]}
      createEvent={(obj) => createEvent(obj.value, obj.tick)}
      onClickAxis={(value) => createEvent(value)}
    />
  )
})

export default React.memo(VolumeGraph)
