import { observer } from "mobx-react-lite"
import { FC } from "react"
import { useStores } from "../../../hooks/useStores"
import { LineGraphItems } from "../../ControlPane/LineGraph/LineGraphItems"

export interface TempoItemsProps {
  width: number
  zIndex: number
}

export const TempoItems: FC<TempoItemsProps> = observer(({ width, zIndex }) => {
  const {
    tempoEditorStore: { items, selectedEventIds, controlPoints, scrollLeft },
  } = useStores()

  return (
    <LineGraphItems
      width={width}
      items={items.map((i) => ({ ...i.bounds, id: i.id }))}
      selectedEventIds={selectedEventIds}
      controlPoints={controlPoints}
      scrollLeft={scrollLeft}
      lineWidth={2}
      zIndex={zIndex}
    />
  )
})
