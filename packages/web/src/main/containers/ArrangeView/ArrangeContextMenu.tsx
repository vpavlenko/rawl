import React from "react"
import {
  ContextMenu,
  MenuItem as ContextMenuItem,
  createContextMenu
} from "components/groups/ContextMenu"
import {
  ARRANGE_COPY_SELECTION,
  ARRANGE_DELETE_SELECTION,
  ARRANGE_PASTE_SELECTION
} from "main/actions/arrangeView"
import { Dispatcher } from "src/main/createDispatcher"
import { IPoint } from "src/common/geometry"

interface ArrangeContextMenuProps {
  dispatch: Dispatcher
  isSelectionSelected: boolean
  close: () => void
}

function ArrangeContextMenu({
  dispatch,
  isSelectionSelected,
  close
}: ArrangeContextMenuProps) {
  return (
    <ContextMenu>
      {isSelectionSelected && (
        <ContextMenuItem
          onClick={() => {
            dispatch(ARRANGE_COPY_SELECTION)
            dispatch(ARRANGE_DELETE_SELECTION)
            close()
          }}
        >
          Cut
        </ContextMenuItem>
      )}
      {isSelectionSelected && (
        <ContextMenuItem
          onClick={() => {
            dispatch(ARRANGE_COPY_SELECTION)
            close()
          }}
        >
          Copy
        </ContextMenuItem>
      )}
      <ContextMenuItem
        onClick={() => {
          dispatch(ARRANGE_PASTE_SELECTION)
          close()
        }}
      >
        Paste
      </ContextMenuItem>
      {isSelectionSelected && (
        <ContextMenuItem
          onClick={() => {
            dispatch(ARRANGE_DELETE_SELECTION)
            close()
          }}
        >
          Delete
        </ContextMenuItem>
      )}
    </ContextMenu>
  )
}

export function open(
  dispatch: Dispatcher,
  {
    position,
    isSelectionSelected
  }: { position: React.MouseEvent; isSelectionSelected: boolean }
) {
  const contextMenu = (close: () => void) =>
    ArrangeContextMenu({ dispatch, isSelectionSelected, close })
  const menuCreator = createContextMenu(contextMenu)
  return menuCreator(position)
}
