import { ContextMenuBuilder } from "../components/groups/ContextMenu"
import { copySelection, pasteSelection, deleteSelection } from "actions"
import RootStore from "../stores/RootStore"

export const PianoContextMenu = (
  rootStore: RootStore,
  isNoteSelected: boolean
): ContextMenuBuilder => (close) => [
  {
    isHidden: !isNoteSelected,
    onClick() {
      copySelection(rootStore)()
      deleteSelection(rootStore)()
      close()
    },
    label: "Cut",
  },
  {
    isHidden: !isNoteSelected,
    onClick() {
      copySelection(rootStore)()
      close()
    },
    label: "Copy",
  },
  {
    onClick() {
      pasteSelection(rootStore)()
      close()
    },
    label: "Paste",
  },
  {
    isHidden: !isNoteSelected,
    onClick() {
      deleteSelection(rootStore)()
      close()
    },
    label: "Delete",
  },
]
