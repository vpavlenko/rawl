import { Tooltip } from "@mui/material"
import TableOfContentsIcon from "mdi-react/FormatListBulletedIcon"
import { FC, useCallback } from "react"
import { localized } from "../../../common/localize/localizedString"
import { useStores } from "../../hooks/useStores"
import { ToolbarButton } from "../Toolbar/ToolbarButton"

export const EventListButton: FC = () => {
  const { pianoRollStore } = useStores()

  return (
    <Tooltip title={localized("event-list", "Event List")}>
      <ToolbarButton
        onClick={useCallback(() => {
          pianoRollStore.showEventList = !pianoRollStore.showEventList
        }, [])}
      >
        <TableOfContentsIcon />
      </ToolbarButton>
    </Tooltip>
  )
}
