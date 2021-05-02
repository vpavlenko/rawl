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
}

export const ArrangeContextMenu: FC<ArrangeContextMenuProps> = ({
  isOpen,
  position,
  handleClose,
}) => {
  const rootStore = useStores()
  const isNoteSelected = Object.values(
    rootStore.arrangeViewStore.selectedEventIds
  ).some((e) => e.length > 0)

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
          handleClose()
          arrangeCopySelection(rootStore)()
          arrangeDeleteSelection(rootStore)()
        }}
        disabled={!isNoteSelected}
      >
        Cut
      </MenuItem>
      <MenuItem
        onClick={(e) => {
          e.stopPropagation()
          handleClose()
          arrangeCopySelection(rootStore)()
        }}
        disabled={!isNoteSelected}
      >
        Copy
      </MenuItem>
      <MenuItem
        onClick={(e) => {
          e.stopPropagation()
          handleClose()
          arrangePasteSelection(rootStore)()
        }}
      >
        Paste
      </MenuItem>
      <MenuItem
        onClick={(e) => {
          e.stopPropagation()
          handleClose()
          arrangeDeleteSelection(rootStore)()
        }}
        disabled={!isNoteSelected}
      >
        Delete
      </MenuItem>
    </Menu>
  )
}
