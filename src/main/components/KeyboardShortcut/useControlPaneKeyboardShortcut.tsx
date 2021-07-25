import { useCallback } from "react"
import {
  copyControlSelection,
  duplicateControlSelection,
  pasteControlSelection,
  removeSelectedControlEvents,
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
            removeSelectedControlEvents(rootStore)()
            break
          case "KeyC":
            if (e.ctrlKey || e.metaKey) {
              copyControlSelection(rootStore)()
            }
            break
          case "KeyX":
            if (e.ctrlKey || e.metaKey) {
              copyControlSelection(rootStore)()
              removeSelectedControlEvents(rootStore)()
            }
            break
          case "KeyV":
            if (e.ctrlKey || e.metaKey) {
              pasteControlSelection(rootStore)()
            }
            break
          case "KeyD": {
            if (e.ctrlKey || e.metaKey) {
              duplicateControlSelection(rootStore)()
            }
            break
          }
          case "Digit1": {
            rootStore.pianoRollStore.mouseMode = "pencil"
            break
          }
          case "Digit2": {
            rootStore.pianoRollStore.mouseMode = "selection"
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
