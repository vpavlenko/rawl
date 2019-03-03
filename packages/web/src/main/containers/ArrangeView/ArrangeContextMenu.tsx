import React from "react"
import { ContextMenu, MenuItem as ContextMenuItem, createContextMenu } from "components/groups/ContextMenu"
import { 
  ARRANGE_COPY_SELECTION, 
  ARRANGE_DELETE_SELECTION, 
  ARRANGE_PASTE_SELECTION 
} from "main/actions/arrangeView"

function ArrangeContextMenu({ dispatch, isSelectionSelected, close }) {
  return <ContextMenu>
    {isSelectionSelected && <ContextMenuItem onClick={() => {
      dispatch(ARRANGE_COPY_SELECTION)
      dispatch(ARRANGE_DELETE_SELECTION)
      close()
    }}>Cut</ContextMenuItem>}
    {isSelectionSelected && <ContextMenuItem onClick={() => {
      dispatch(ARRANGE_COPY_SELECTION)
      close()
    }}>Copy</ContextMenuItem>}
    <ContextMenuItem onClick={() => {
      dispatch(ARRANGE_PASTE_SELECTION)
      close()
    }}>Paste</ContextMenuItem>
    {isSelectionSelected && <ContextMenuItem onClick={() => {
      dispatch(ARRANGE_DELETE_SELECTION)
      close()
    }}>Delete</ContextMenuItem>}
  </ContextMenu>
}

export function open(dispatch, { position, isSelectionSelected }) {
  const contextMenu = close => ArrangeContextMenu({ dispatch, isSelectionSelected, close })
  const menuCreator = createContextMenu(contextMenu)
  return menuCreator(position)
}
