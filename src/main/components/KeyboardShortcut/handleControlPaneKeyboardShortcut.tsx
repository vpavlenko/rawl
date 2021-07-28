import {
  copyControlSelection,
  deleteControlSelection,
  duplicateControlSelection,
  resetControlSelection,
} from "../../actions/control"
import RootStore from "../../stores/RootStore"

export const handleControlPaneKeyboardShortcut =
  (rootStore: RootStore) => (e: KeyboardEvent) => {
    if (rootStore.pianoRollStore.selectedControllerEventIds.length === 0) {
      return false
    }

    switch (e.code) {
      case "Escape": {
        resetControlSelection(rootStore)()
        break
      }
      case "Backspace":
      case "Delete":
        deleteControlSelection(rootStore)()
        break
      case "KeyC":
        if (e.ctrlKey || e.metaKey) {
          copyControlSelection(rootStore)()
        }
        break
      case "KeyX":
        if (e.ctrlKey || e.metaKey) {
          copyControlSelection(rootStore)()
          deleteControlSelection(rootStore)()
        }
        break
      case "KeyD": {
        if (e.ctrlKey || e.metaKey) {
          duplicateControlSelection(rootStore)()
        }
        break
      }
      default:
        return false
    }
    return true
  }
