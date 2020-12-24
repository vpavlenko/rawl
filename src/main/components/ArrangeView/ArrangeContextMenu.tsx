import { Menu, MenuItem } from "@material-ui/core"
import React, { FC } from "react"
import { IPoint } from "../../../common/geometry"
import {
  arrangeCopySelection,
  arrangeDeleteSelection,
  arrangePasteSelection,
} from "../../actions/arrangeView"
import { useStores } from "../../hooks/useStores"

export interface ArrangeContextMenuProps {
  isOpen: boolean
  position: IPoint
  handleClose: () => void
  isSelectionSelected: boolean
}

export const ArrangeContextMenu: FC<ArrangeContextMenuProps> = ({
  isOpen,
  position,
  handleClose,
  isSelectionSelected,
}) => {
  const rootStore = useStores()

  return (
    <Menu
      keepMounted
      open={isOpen}
      onClose={handleClose}
      anchorReference="anchorPosition"
      anchorPosition={{ top: position.y, left: position.x }}
    >
      {isSelectionSelected && (
        <MenuItem
          onClick={(e) => {
            e.stopPropagation()
            handleClose()
            arrangeCopySelection(rootStore)()
            arrangeDeleteSelection(rootStore)()
          }}
        >
          Cut
        </MenuItem>
      )}
      {isSelectionSelected && (
        <MenuItem
          onClick={(e) => {
            e.stopPropagation()
            handleClose()
            arrangeCopySelection(rootStore)()
          }}
        >
          Copy
        </MenuItem>
      )}
      {
        <MenuItem
          onClick={(e) => {
            e.stopPropagation()
            handleClose()
            arrangePasteSelection(rootStore)()
          }}
        >
          Paste
        </MenuItem>
      }
      {isSelectionSelected && (
        <MenuItem
          onClick={(e) => {
            e.stopPropagation()
            handleClose()
            arrangeDeleteSelection(rootStore)()
          }}
        >
          Delete
        </MenuItem>
      )}
    </Menu>
  )
}
