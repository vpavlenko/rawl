import { Dispatcher } from "main/createDispatcher"
import { ContextMenuBuilder } from "../components/groups/ContextMenu"
import { copySelection, pasteSelection, deleteSelection } from "actions"

export const PianoContextMenu = (
  dispatch: Dispatcher,
  isNoteSelected: boolean
): ContextMenuBuilder => (close) => [
  {
    isHidden: !isNoteSelected,
    onClick() {
      dispatch(copySelection())
      dispatch(deleteSelection())
      close()
    },
    label: "Cut",
  },
  {
    isHidden: !isNoteSelected,
    onClick() {
      dispatch(copySelection())
      close()
    },
    label: "Copy",
  },
  {
    onClick() {
      dispatch(pasteSelection())
      close()
    },
    label: "Paste",
  },
  {
    isHidden: !isNoteSelected,
    onClick() {
      dispatch(deleteSelection())
      close()
    },
    label: "Delete",
  },
]
