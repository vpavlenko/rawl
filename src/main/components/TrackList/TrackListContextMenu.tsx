import { MenuItem } from "@material-ui/core"
import { FC } from "react"
import { localized } from "../../../common/localize/localizedString"
import { ContextMenu, ContextMenuProps } from "../ContextMenu/ContextMenu"

export type TrackListContextMenuProps = ContextMenuProps & {
  onClickAdd: () => void
  onClickDelete: () => void
}

export const TrackListContextMenu: FC<TrackListContextMenuProps> = ({
  onClickAdd,
  onClickDelete,
  ...props
}) => {
  const { handleClose } = props
  return (
    <ContextMenu {...props}>
      <MenuItem
        onClick={(e) => {
          e.stopPropagation()
          onClickAdd()
          handleClose()
        }}
      >
        {localized("add-track", "Add track")}
      </MenuItem>
      <MenuItem
        onClick={(e) => {
          e.stopPropagation()
          onClickDelete()
          handleClose()
        }}
      >
        {localized("delete-track", "Delete track")}
      </MenuItem>
    </ContextMenu>
  )
}
