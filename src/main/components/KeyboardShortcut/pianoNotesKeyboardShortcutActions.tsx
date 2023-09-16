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
  rootStore: RootStore,
): Action[] => [
  {
    code: "KeyC",
    metaKey: true,
    run: () => copySelection(rootStore)(),
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
    run: () => pasteSelection(rootStore)(),
  },
  {
    code: "KeyD",
    metaKey: true,
    run: () => duplicateSelection(rootStore)(),
  },
  {
    code: "KeyA",
    metaKey: true,
    run: () => selectAllNotes(rootStore)(),
  },
  {
    code: "KeyQ",
    run: () => quantizeSelectedNotes(rootStore)(),
  },
  {
    code: "KeyT",
    run: () => (rootStore.pianoRollStore.openTransposeDialog = true),
  },
  { code: "Delete", run: () => deleteSelection(rootStore)() },
  {
    code: "Backspace",
    run: () => deleteSelection(rootStore)(),
  },
  {
    code: "ArrowUp",
    shiftKey: true,
    run: () => transposeSelection(rootStore)(12),
  },
  {
    code: "ArrowUp",
    run: () => transposeSelection(rootStore)(1),
  },
  {
    code: "ArrowDown",
    shiftKey: true,
    run: () => transposeSelection(rootStore)(-12),
  },
  {
    code: "ArrowDown",
    run: () => transposeSelection(rootStore)(-1),
  },
  {
    code: "ArrowRight",
    run: selectNextNote(rootStore),
    enabled: () => rootStore.pianoRollStore.mouseMode == "pencil",
  },
  {
    code: "ArrowLeft",
    run: selectPreviousNote(rootStore),
    enabled: () => rootStore.pianoRollStore.mouseMode == "pencil",
  },
  { code: "Escape", run: () => resetSelection(rootStore)() },
]
