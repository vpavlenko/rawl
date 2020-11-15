import { Menu, MenuItem } from "@material-ui/core"
import React, { FC, useCallback } from "react"
import { IPoint } from "../../../common/geometry"
import { localized } from "../../../common/localize/localizedString"
import {
  copySelection,
  deleteSelection,
  duplicateSelection,
  pasteSelection,
} from "../../actions"
import { useStores } from "../../hooks/useStores"

interface AbstractMouseEvent {
  preventDefault: () => void
  clientX: number
  clientY: number
}

export const useContextMenu = () => {
  const [state, setState] = React.useState({
    mouseX: 0,
    mouseY: 0,
    isOpen: false,
  })

  const onContextMenu = (e: AbstractMouseEvent) => {
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

export interface PianoSelectionContextMenuProps {
  isOpen: boolean
  position: IPoint
  handleClose: () => void
}

export const PianoSelectionContextMenu: FC<PianoSelectionContextMenuProps> = React.memo(
  ({ isOpen, position, handleClose }) => {
    const rootStore = useStores()
    const isNoteSelected = rootStore.pianoRollStore.selection.noteIds.length > 0

    const onClickCut = useCallback(() => {
      copySelection(rootStore)()
      deleteSelection(rootStore)()
      handleClose()
    }, [])

    const onClickCopy = useCallback(() => {
      copySelection(rootStore)()
      handleClose()
    }, [])

    const onClickPaste = useCallback(() => {
      pasteSelection(rootStore)()
      handleClose()
    }, [])

    const onClickDuplicate = useCallback(() => {
      duplicateSelection(rootStore)()
      handleClose()
    }, [])

    const onClickDelete = useCallback(() => {
      deleteSelection(rootStore)()
      handleClose()
    }, [])

    return (
      <Menu
        keepMounted
        open={isOpen}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={{ top: position.y, left: position.x }}
      >
        <MenuItem onClick={onClickCut} disabled={!isNoteSelected}>
          {localized("cut", "Cut")}
        </MenuItem>
        <MenuItem onClick={onClickCopy} disabled={!isNoteSelected}>
          {localized("copy", "Copy")}
        </MenuItem>
        <MenuItem onClick={onClickPaste}>
          {localized("paste", "Paste")}
        </MenuItem>
        <MenuItem onClick={onClickDuplicate} disabled={!isNoteSelected}>
          {localized("duplicate", "Duplicate")}
        </MenuItem>
        <MenuItem onClick={onClickDelete} disabled={!isNoteSelected}>
          {localized("delete", "Delete")}
        </MenuItem>
      </Menu>
    )
  }
)
