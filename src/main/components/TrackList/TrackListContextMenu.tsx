import React, { SFC } from "react"
import { Menu, MenuItem } from "@material-ui/core"
import { IPoint } from "common/geometry"

export const useContextMenu = () => {
  const [state, setState] = React.useState({
    mouseX: 0,
    mouseY: 0,
    isOpen: false,
  })

  const onContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setState({
      mouseX: e.clientX - 2,
      mouseY: e.clientY - 4,
      isOpen: true,
    })
  }

  const handleClose = () => {
    setState({ ...state, isOpen: false })
  }

  return {
    onContextMenu,
    menuProps: {
      handleClose,
      isOpen: state.isOpen,
      position: { x: state.mouseX, y: state.mouseY },
    },
  }
}

export interface TrackListContextMenuProps {
  isOpen: boolean
  position: IPoint
  onClickDelete: () => void
  handleClose: () => void
}

export const TrackListContextMenu: SFC<TrackListContextMenuProps> = ({
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
        onClick={() => {
          onClickDelete()
          handleClose()
        }}
      >
        Delete Track
      </MenuItem>
    </Menu>
  )
}
