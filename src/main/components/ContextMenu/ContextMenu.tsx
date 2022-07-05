import styled from "@emotion/styled"
import { Menu, MenuItem } from "@mui/material"
import { FC, ReactNode, useEffect } from "react"
import { IPoint } from "../../../common/geometry"

export const ContextMenuItem = styled(MenuItem)`
  font-size: 0.8rem;
`

export const ContextMenuHotKey = styled.div`
  font-size: 0.9em;
  flex-grow: 1;
  text-align: right;
  color: ${({ theme }) => theme.secondaryTextColor};
  margin-left: 2em;
`

export interface ContextMenuProps {
  isOpen: boolean
  position: IPoint
  handleClose: () => void
  children?: ReactNode
}

export const ContextMenu: FC<ContextMenuProps> = ({
  isOpen,
  handleClose,
  position,
  children,
}) => {
  // Menu cannot handle keydown while disabling focus, so we deal with global keydown event
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === "Escape") {
        handleClose()
      }
    }
    document.addEventListener("keydown", onKeyDown)

    return () => {
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [isOpen])

  return (
    <Menu
      open={isOpen}
      onClose={handleClose}
      anchorReference="anchorPosition"
      anchorPosition={{ top: position.y, left: position.x }}
      autoFocus={false}
      disableEnforceFocus={true}
      disableAutoFocus={true}
      disableAutoFocusItem={true}
      disableRestoreFocus={true}
      disablePortal
      transitionDuration={0}
      MenuListProps={{
        disableListWrap: true,
        disablePadding: true,
        style: { padding: "inherit", width: "inherit" },
      }}
    >
      {children}
    </Menu>
  )
}
