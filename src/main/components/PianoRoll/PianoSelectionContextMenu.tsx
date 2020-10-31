import { Menu, MenuItem } from "@material-ui/core"
import React, { FC, useCallback } from "react"
import { IPoint } from "../../../common/geometry"
import { copySelection, deleteSelection, pasteSelection } from "../../actions"
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
    const { rootStore } = useStores()
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
        {isNoteSelected && <MenuItem onClick={onClickCut}>Cut</MenuItem>}
        {isNoteSelected && <MenuItem onClick={onClickCopy}>Copy</MenuItem>}
        <MenuItem onClick={onClickPaste}>Paste</MenuItem>
        {isNoteSelected && <MenuItem onClick={onClickDelete}>Delete</MenuItem>}
      </Menu>
    )
  }
)
