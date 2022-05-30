import { observer } from "mobx-react-lite"
import { VFC } from "react"
import { useStores } from "../../../hooks/useStores"
import { LineGraphItems } from "../../ControlPane/LineGraph/LineGraphItems"

export interface TempoItemsProps {
  width: number
  zIndex: number
}

export const TempoItems: VFC<TempoItemsProps> = observer(
  ({ width, zIndex }) => {
    const rootStore = useStores()
    const { items, selectedEventIds, controlPoints, scrollLeft } =
      rootStore.tempoEditorStore

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
  }
)
