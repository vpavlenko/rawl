import React, { StatelessComponent } from "react"
import {
  ContextMenu,
  MenuItem as ContextMenuItem,
  createContextMenu
} from "components/groups/ContextMenu"
import { Dispatcher } from "main/createDispatcher"
import { COPY_SELECTION, DELETE_SELECTION, PASTE_SELECTION } from "main/actions"
import { Omit } from "recompose"
import { IPoint } from "src/common/geometry"

export interface PianoContextMenuProps {
  dispatch: Dispatcher
  isNoteSelected: boolean
  close: () => void
}

const PianoContextMenu: StatelessComponent<PianoContextMenuProps> = ({
  dispatch,
  isNoteSelected,
  close
}) => {
  return (
    <ContextMenu>
      {isNoteSelected && (
        <ContextMenuItem
          onClick={() => {
            dispatch(COPY_SELECTION)
            dispatch(DELETE_SELECTION)
            close()
          }}
        >
          Cut
        </ContextMenuItem>
      )}
      {isNoteSelected && (
        <ContextMenuItem
          onClick={() => {
            dispatch(COPY_SELECTION)
            close()
          }}
        >
          Copy
        </ContextMenuItem>
      )}
      <ContextMenuItem
        onClick={() => {
          dispatch(PASTE_SELECTION)
          close()
        }}
      >
        Paste
      </ContextMenuItem>
      {isNoteSelected && (
        <ContextMenuItem
          onClick={() => {
            dispatch(DELETE_SELECTION)
            close()
          }}
        >
          Delete
        </ContextMenuItem>
      )}
    </ContextMenu>
  )
}

export interface PianoContextMenuParams {
  position: React.MouseEvent
  isNoteSelected: boolean
}

export function open(
  dispatch: Dispatcher,
  { position, isNoteSelected }: PianoContextMenuParams
) {
  const contextMenu = (close: () => void) =>
    PianoContextMenu({ dispatch, isNoteSelected, close })
  const menuCreator = createContextMenu(contextMenu)
  return menuCreator(position)
}
