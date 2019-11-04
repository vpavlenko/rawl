import { COPY_SELECTION, DELETE_SELECTION, PASTE_SELECTION } from "main/actions"
import { Dispatcher } from "main/createDispatcher"
import { ContextMenuBuilder } from "../components/groups/ContextMenu"

export const PianoContextMenu = (
  dispatch: Dispatcher,
  isNoteSelected: boolean
): ContextMenuBuilder => close => [
  {
    isHidden: !isNoteSelected,
    onClick() {
      dispatch(COPY_SELECTION)
      dispatch(DELETE_SELECTION)
      close()
    },
    label: "Cut"
  },
  {
    isHidden: !isNoteSelected,
    onClick() {
      dispatch(COPY_SELECTION)
      close()
    },
    label: "Copy"
  },
  {
    onClick() {
      dispatch(PASTE_SELECTION)
      close()
    },
    label: "Paste"
  },
  {
    isHidden: !isNoteSelected,
    onClick() {
      dispatch(DELETE_SELECTION)
      close()
    },
    label: "Delete"
  }
]
