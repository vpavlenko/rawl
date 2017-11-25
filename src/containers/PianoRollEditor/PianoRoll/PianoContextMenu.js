import React from "react"
import { ContextMenu, MenuItem as ContextMenuItem, createContextMenu } from "components/groups/ContextMenu"

function PianoContextMenu({ dispatch, isNoteSelected, close }) {
  return <ContextMenu>
    {isNoteSelected && <ContextMenuItem onClick={() => {
      dispatch("COPY_SELECTION")
      dispatch("DELETE_SELECTION")
      close()
    }}>Cut</ContextMenuItem>}
    {isNoteSelected && <ContextMenuItem onClick={() => {
      dispatch("COPY_SELECTION")
      close()
    }}>Copy</ContextMenuItem>}
    <ContextMenuItem onClick={() => {
      dispatch("PASTE_SELECTION")
      close()
    }}>Paste</ContextMenuItem>
    {isNoteSelected && <ContextMenuItem onClick={() => {
      dispatch("DELETE_SELECTION")
      close()
    }}>Delete</ContextMenuItem>}
  </ContextMenu>
}

export function open(dispatch, { position, isNoteSelected }) {
  const contextMenu = close => PianoContextMenu({ dispatch, isNoteSelected, close })
  const menuCreator = createContextMenu(contextMenu)
  return menuCreator(position)
}
