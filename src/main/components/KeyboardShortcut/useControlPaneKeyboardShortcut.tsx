import { useCallback } from "react"
import {
  copyControlSelection,
  deleteControlSelection,
  duplicateControlSelection,
  resetControlSelection,
} from "../../actions/control"
import { useStores } from "../../hooks/useStores"

export const useControlPaneKeyboardShortcut =
  (): React.KeyboardEventHandler => {
    const rootStore = useStores()

    return useCallback(
      (e) => {
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
            // do not call preventDefault
            return
        }
        e.preventDefault()
      },
      [rootStore]
    )
  }
