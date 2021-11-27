import { FC, useEffect } from "react"
import {
  copyTempoSelection,
  deleteTempoSelection,
  duplicateTempoSelection,
  pasteTempoSelection,
  resetTempoSelection,
} from "../../actions/tempo"
import { isTempoEventsClipboardData } from "../../clipboard/clipboardTypes"
import { useStores } from "../../hooks/useStores"
import clipboard from "../../services/Clipboard"
import { isFocusable } from "./isFocusable"

export const TempoEditorKeyboardShortcut: FC = () => {
  const rootStore = useStores()

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target !== null && isFocusable(e.target)) {
        return
      }
      switch (e.code) {
        case "Digit1": {
          rootStore.tempoEditorStore.mouseMode = "pencil"
          break
        }
        case "Digit2": {
          rootStore.tempoEditorStore.mouseMode = "selection"
          break
        }
        case "Escape": {
          resetTempoSelection(rootStore)()
          break
        }
        case "Backspace":
        case "Delete":
          deleteTempoSelection(rootStore)()
          break
        case "KeyC":
          if (e.ctrlKey || e.metaKey) {
            copyTempoSelection(rootStore)()
          }
          break
        case "KeyX":
          if (e.ctrlKey || e.metaKey) {
            copyTempoSelection(rootStore)()
            deleteTempoSelection(rootStore)()
          }
          break
        case "KeyD": {
          if (e.ctrlKey || e.metaKey) {
            duplicateTempoSelection(rootStore)()
          }
          break
        }
        default:
          // do not call preventDefault
          return
      }
      e.preventDefault()
    }

    const onPaste = (e: ClipboardEvent) => {
      if (e.target !== null && isFocusable(e.target)) {
        return
      }

      const text = clipboard.readText()

      if (!text || text.length === 0) {
        return
      }

      const obj = JSON.parse(text)

      if (isTempoEventsClipboardData(obj)) {
        pasteTempoSelection(rootStore)()
      }
    }

    document.addEventListener("paste", onPaste)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("paste", onPaste)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [rootStore])

  return <></>
}
