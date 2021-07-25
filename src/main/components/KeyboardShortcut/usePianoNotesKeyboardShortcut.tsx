import { useCallback } from "react"
import {
  copySelection,
  deleteSelection,
  duplicateSelection,
  resetSelection,
  selectNextNote,
  selectPreviousNote,
  transposeSelection,
} from "../../actions"
import { useStores } from "../../hooks/useStores"

const SCROLL_DELTA = 24

export const usePianoNotesKeyboardShortcut = (): React.KeyboardEventHandler => {
  const rootStore = useStores()

  return useCallback(
    (e) => {
      switch (e.code) {
        case "Escape": {
          resetSelection(rootStore)()
          break
        }
        case "KeyC":
          if (e.ctrlKey || e.metaKey) {
            copySelection(rootStore)()
          }
          break
        case "KeyX":
          if (e.ctrlKey || e.metaKey) {
            copySelection(rootStore)()
            deleteSelection(rootStore)()
          }
          break
        case "KeyD": {
          if (e.ctrlKey || e.metaKey) {
            duplicateSelection(rootStore)()
          }
          break
        }
        case "Delete":
        case "Backspace": {
          deleteSelection(rootStore)()
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
        case "ArrowUp": {
          if (e.ctrlKey || e.metaKey) {
            rootStore.pianoRollStore.scrollBy(0, SCROLL_DELTA)
          } else {
            transposeSelection(rootStore)(e.shiftKey ? 12 : 1)
          }
          break
        }
        case "ArrowDown": {
          if (e.ctrlKey || e.metaKey) {
            rootStore.pianoRollStore.scrollBy(0, -SCROLL_DELTA)
          } else {
            transposeSelection(rootStore)(e.shiftKey ? -12 : -1)
          }
          break
        }
        case "ArrowRight":
          if (e.ctrlKey || e.metaKey) {
            rootStore.pianoRollStore.scrollBy(-SCROLL_DELTA, 0)
          } else if (rootStore.pianoRollStore.mouseMode == "pencil") {
            selectNextNote(rootStore)()
          }
          break
        case "ArrowLeft":
          if (e.ctrlKey || e.metaKey) {
            rootStore.pianoRollStore.scrollBy(SCROLL_DELTA, 0)
          } else if (rootStore.pianoRollStore.mouseMode == "pencil") {
            selectPreviousNote(rootStore)()
          }
          break
        default:
          // do not call preventDefault
          return
      }
      e.preventDefault()
    },
    [rootStore]
  )
}
