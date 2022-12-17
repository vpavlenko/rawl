import FormatListBulleted from "mdi-react/FormatListBulletedIcon"
import { FC, useCallback } from "react"
import { Localized } from "../../../components/Localized"
import { Tooltip } from "../../../components/Tooltip"
import { useStores } from "../../hooks/useStores"
import { ToolbarButton } from "../Toolbar/ToolbarButton"

export const EventListButton: FC = () => {
  const { pianoRollStore } = useStores()

  return (
    <Tooltip title={<Localized default="Event List">event-list</Localized>}>
      <ToolbarButton
        onClick={useCallback(() => {
          pianoRollStore.showEventList = !pianoRollStore.showEventList
        }, [])}
      >
        <FormatListBulleted />
      </ToolbarButton>
    </Tooltip>
  )
}
