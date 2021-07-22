import { observer } from "mobx-react-lite"
import React, { FC } from "react"
import { ISize } from "../../../../common/geometry"
import { isExpressionEvent } from "../../../../common/track"
import { createPan } from "../../../actions"
import { useStores } from "../../../hooks/useStores"
import LineGraphControl from "./LineGraphControl"

export type ExpressionGraphProps = ISize

const ExpressionGraph: FC<ExpressionGraphProps> = observer(
  ({ width, height }) => {
    const rootStore = useStores()
    const createEvent = createPan(rootStore)
    const events =
      rootStore.pianoRollStore.controllerEvents.filter(isExpressionEvent)

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
  }
)

export default React.memo(ExpressionGraph)
