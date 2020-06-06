import { ContextMenuBuilder } from "components/groups/ContextMenu"
import {
  arrangeCopySelection,
  arrangeDeleteSelection,
  arrangePasteSelection,
} from "main/actions/arrangeView"
import RootStore from "../stores/RootStore"

export const ArrangeContextMenu = (
  rootStore: RootStore,
  isSelectionSelected: boolean
): ContextMenuBuilder => (close) => [
  {
    isHidden: !isSelectionSelected,
    onClick() {
      arrangeCopySelection(rootStore)()
      arrangeDeleteSelection(rootStore)()
      close()
    },
    label: "Cut",
  },
  {
    isHidden: !isSelectionSelected,
    onClick() {
      arrangeCopySelection(rootStore)()
      close()
    },
    label: "Copy",
  },
  {
    onClick() {
      arrangePasteSelection(rootStore)()
      close()
    },
    label: "Paste",
  },
  {
    isHidden: !isSelectionSelected,
    onClick() {
      arrangeDeleteSelection(rootStore)()
      close()
    },
    label: "Delete",
  },
]
