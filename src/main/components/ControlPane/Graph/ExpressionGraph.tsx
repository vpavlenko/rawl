import React, { FC } from "react"
import { ISize } from "../../../../common/geometry"
import { createPan } from "../../../actions"
import { useStores } from "../../../hooks/useStores"
import LineGraphControl from "./LineGraphControl"

export type ExpressionGraphProps = ISize

const ExpressionGraph: FC<ExpressionGraphProps> = ({ width, height }) => {
  const rootStore = useStores()
  const createEvent = createPan(rootStore)

  return (
    <LineGraphControl
      width={width}
      height={height}
      maxValue={127}
      filterEvent={(e) => (e as any).controllerType === 0x0b}
      axis={[0, 0x20, 0x40, 0x60, 0x80 - 1]}
      createEvent={(obj) => createEvent(obj.value, obj.tick)}
      onClickAxis={(value) => createEvent(value)}
    />
  )
}

export default React.memo(ExpressionGraph)
