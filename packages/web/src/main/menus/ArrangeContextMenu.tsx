import { ContextMenuBuilder } from "components/groups/ContextMenu"
import { Dispatcher } from "createDispatcher"
import {
  ARRANGE_COPY_SELECTION,
  ARRANGE_DELETE_SELECTION,
  ARRANGE_PASTE_SELECTION
} from "main/actions/arrangeView"

export const ArrangeContextMenu = (
  dispatch: Dispatcher,
  isSelectionSelected: boolean
): ContextMenuBuilder => close => [
  {
    isHidden: !isSelectionSelected,
    onClick() {
      dispatch(ARRANGE_COPY_SELECTION)
      dispatch(ARRANGE_DELETE_SELECTION)
      close()
    },
    label: "Cut"
  },
  {
    isHidden: !isSelectionSelected,
    onClick() {
      dispatch(ARRANGE_COPY_SELECTION)
      close()
    },
    label: "Copy"
  },
  {
    onClick() {
      dispatch(ARRANGE_PASTE_SELECTION)
      close()
    },
    label: "Paste"
  },
  {
    isHidden: !isSelectionSelected,
    onClick() {
      dispatch(ARRANGE_DELETE_SELECTION)
      close()
    },
    label: "Delete"
  }
]
