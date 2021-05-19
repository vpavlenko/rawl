import { Menu, MenuItem } from "@material-ui/core"
import { FC } from "react"
import { IPoint } from "../../../common/geometry"
import { localized } from "../../../common/localize/localizedString"

export interface TrackListContextMenuProps {
  isOpen: boolean
  position: IPoint
  onClickDelete: () => void
  handleClose: () => void
}

export const TrackListContextMenu: FC<TrackListContextMenuProps> = ({
  isOpen,
  position,
  onClickDelete,
  handleClose,
}) => {
  return (
    <Menu
      keepMounted
      open={isOpen}
      onClose={handleClose}
      anchorReference="anchorPosition"
      anchorPosition={{ top: position.y, left: position.x }}
    >
      <MenuItem
        onClick={(e) => {
          e.stopPropagation()
          onClickDelete()
          handleClose()
        }}
      >
        {localized("delete-track", "Delete track")}
      </MenuItem>
    </Menu>
  )
}
