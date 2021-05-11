import React, { FC } from "react"
import { ISize } from "../../../../common/geometry"
import { createVolume } from "../../../actions"
import { useStores } from "../../../hooks/useStores"
import LineGraphControl from "./LineGraphControl"

export type VolumeGraphProps = ISize

const VolumeGraph: FC<VolumeGraphProps> = ({ width, height }) => {
  const rootStore = useStores()
  const createEvent = createVolume(rootStore)

  return (
    <LineGraphControl
      width={width}
      height={height}
      maxValue={127}
      filterEvent={(e) => (e as any).controllerType === 0x07}
      axis={[0, 0x20, 0x40, 0x60, 0x80 - 1]}
      createEvent={(obj) => createEvent(obj.value, obj.tick)}
      onClickAxis={(value) => createEvent(value)}
    />
  )
}

export default React.memo(VolumeGraph)
