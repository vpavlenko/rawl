import { FC, useEffect } from "react"
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

      // if (isPianoNotesClipboardData(obj)) {
      //   pasteSelection(rootStore)()
      // }
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
