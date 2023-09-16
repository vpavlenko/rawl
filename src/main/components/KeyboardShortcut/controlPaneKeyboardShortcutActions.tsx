import {
  copyControlSelection,
  deleteControlSelection,
  duplicateControlSelection,
  resetControlSelection,
} from "../../actions/control"
import RootStore from "../../stores/RootStore"
import { Action } from "./KeyboardShortcut"

export const controlPaneKeyboardShortcutActions = (
  rootStore: RootStore,
): Action[] => [
  { code: "Escape", run: () => resetControlSelection(rootStore)() },
  { code: "Backspace", run: () => deleteControlSelection(rootStore)() },
  { code: "Delete", run: () => deleteControlSelection(rootStore)() },
  { code: "KeyC", metaKey: true, run: () => copyControlSelection(rootStore)() },
  {
    code: "KeyX",
    metaKey: true,
    run: () => {
      copyControlSelection(rootStore)()
      deleteControlSelection(rootStore)()
    },
  },
  {
    code: "KeyD",
    metaKey: true,
    run: () => duplicateControlSelection(rootStore)(),
  },
]
