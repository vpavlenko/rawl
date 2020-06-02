import { ContextMenuBuilder } from "components/groups/ContextMenu"
import { Dispatcher } from "createDispatcher"
import {
  arrangeCopySelection,
  arrangeDeleteSelection,
  arrangePasteSelection,
} from "main/actions/arrangeView"

export const ArrangeContextMenu = (
  dispatch: Dispatcher,
  isSelectionSelected: boolean
): ContextMenuBuilder => (close) => [
  {
    isHidden: !isSelectionSelected,
    onClick() {
      dispatch(arrangeCopySelection())
      dispatch(arrangeDeleteSelection())
      close()
    },
    label: "Cut",
  },
  {
    isHidden: !isSelectionSelected,
    onClick() {
      dispatch(arrangeCopySelection())
      close()
    },
    label: "Copy",
  },
  {
    onClick() {
      dispatch(arrangePasteSelection())
      close()
    },
    label: "Paste",
  },
  {
    isHidden: !isSelectionSelected,
    onClick() {
      dispatch(arrangeDeleteSelection())
      close()
    },
    label: "Delete",
  },
]
