import { useCallback } from "react"
import {
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
