import {
  copySelection,
  deleteSelection,
  duplicateSelection,
  pasteSelection,
  quantizeSelectedNotes,
  resetSelection,
  selectAllNotes,
  selectNextNote,
  selectPreviousNote,
  transposeSelection,
} from "../../actions"
import RootStore from "../../stores/RootStore"
import { Action } from "./KeyboardShortcut"

export const pianoNotesKeyboardShortcutActions = (
  rootStore: RootStore
): Action[] => [
  {
    code: "KeyC",
    metaKey: true,
    run: copySelection(rootStore),
  },
  {
    code: "KeyX",
    metaKey: true,
    run: () => {
      copySelection(rootStore)()
      deleteSelection(rootStore)()
    },
  },
  {
    code: "KeyV",
    metaKey: true,
    run: pasteSelection(rootStore),
  },
  {
    code: "KeyD",
    metaKey: true,
    run: duplicateSelection(rootStore),
  },
  {
    code: "KeyA",
    metaKey: true,
    run: selectAllNotes(rootStore),
  },
  {
    code: "KeyQ",
    run: quantizeSelectedNotes(rootStore),
  },
  { code: "Delete", run: deleteSelection(rootStore) },
  {
    code: "Backspace",
    run: deleteSelection(rootStore),
  },
  {
    code: "ArrowUp",
    metaKey: true,
    run: (e) => transposeSelection(rootStore)(e.shiftKey ? 12 : 1),
  },
  {
    code: "ArrowDown",
    metaKey: true,
    run: (e) => transposeSelection(rootStore)(e.shiftKey ? -12 : -1),
  },
  {
    code: "ArrowRight",
    metaKey: true,
    run: selectNextNote(rootStore),
    enabled: () => rootStore.pianoRollStore.mouseMode == "pencil",
  },
  {
    code: "ArrowLeft",
    metaKey: true,
    run: selectPreviousNote(rootStore),
    enabled: () => rootStore.pianoRollStore.mouseMode == "pencil",
  },
  { code: "Escape", run: resetSelection(rootStore) },
]
