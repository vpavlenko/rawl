import {
  copySelection,
  deleteSelection,
  duplicateSelection,
  quantizeSelectedNotes,
  resetSelection,
  selectAllNotes,
  selectNextNote,
  selectPreviousNote,
  transposeSelection,
} from "../../actions"
import RootStore from "../../stores/RootStore"

const SCROLL_DELTA = 24

export const handlePianoNotesKeyboardShortcut =
  (rootStore: RootStore) =>
  (e: KeyboardEvent): boolean => {
    const isSelected = rootStore.pianoRollStore.selectedNoteIds.length > 0

    switch (e.code) {
      case "Escape": {
        resetSelection(rootStore)()
        return true
      }
      case "KeyA": {
        if (e.ctrlKey) {
          selectAllNotes(rootStore)()
          return true
        }

        return false
      }
      case "KeyC":
        if ((e.ctrlKey || e.metaKey) && isSelected) {
          copySelection(rootStore)()
          return true
        }
        return false
      case "KeyX":
        if ((e.ctrlKey || e.metaKey) && isSelected) {
          copySelection(rootStore)()
          deleteSelection(rootStore)()
          return true
        }
        return false
      case "KeyD": {
        if ((e.ctrlKey || e.metaKey) && isSelected) {
          duplicateSelection(rootStore)()
          return true
        }
        return false
      }
      case "KeyQ": {
        if (isSelected) {
          quantizeSelectedNotes(rootStore)()
          return true
        }
        return false
      }
      case "Delete":
      case "Backspace": {
        if (isSelected) {
          deleteSelection(rootStore)()
          return true
        }
        return false
      }
      case "ArrowUp": {
        if (e.ctrlKey || e.metaKey) {
          rootStore.pianoRollStore.scrollBy(0, SCROLL_DELTA)
          return true
        } else if (isSelected) {
          transposeSelection(rootStore)(e.shiftKey ? 12 : 1)
          return true
        }
        return false
      }
      case "ArrowDown": {
        if (e.ctrlKey || e.metaKey) {
          rootStore.pianoRollStore.scrollBy(0, -SCROLL_DELTA)
          return true
        } else if (isSelected) {
          transposeSelection(rootStore)(e.shiftKey ? -12 : -1)
          return true
        }
        return false
      }
      case "ArrowRight":
        if (e.ctrlKey || e.metaKey) {
          rootStore.pianoRollStore.scrollBy(-SCROLL_DELTA, 0)
          return true
        } else if (
          rootStore.pianoRollStore.mouseMode == "pencil" &&
          isSelected
        ) {
          selectNextNote(rootStore)()
          return true
        }
        return false
      case "ArrowLeft":
        if (e.ctrlKey || e.metaKey) {
          rootStore.pianoRollStore.scrollBy(SCROLL_DELTA, 0)
          return true
        } else if (
          rootStore.pianoRollStore.mouseMode == "pencil" &&
          isSelected
        ) {
          selectPreviousNote(rootStore)()
          return true
        }
        return false
      default:
        return false
    }
  }
