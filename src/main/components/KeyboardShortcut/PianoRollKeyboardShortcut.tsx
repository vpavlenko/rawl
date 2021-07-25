import { FC, useEffect } from "react"
import { pasteSelection } from "../../actions"
import { pasteControlSelection } from "../../actions/control"
import {
  isControlEventsClipboardData,
  isPianoNotesClipboardData,
} from "../../clipboard/clipboardTypes"
import { useStores } from "../../hooks/useStores"
import clipboard from "../../services/Clipboard"

const isFocusable = (e: EventTarget) =>
  e instanceof HTMLAnchorElement ||
  e instanceof HTMLAreaElement ||
  e instanceof HTMLInputElement ||
  e instanceof HTMLSelectElement ||
  e instanceof HTMLTextAreaElement ||
  e instanceof HTMLButtonElement ||
  e instanceof HTMLIFrameElement

export const PianoRollKeyboardShortcut: FC = () => {
  const rootStore = useStores()

  useEffect(() => {
    // Handle pasting here to allow pasting even when the element does not have focus, such as after clicking the ruler
    const onPaste = (e: ClipboardEvent) => {
      if (e.target !== null && isFocusable(e.target)) {
        return
      }

      const text = clipboard.readText()

      if (!text || text.length === 0) {
        return
      }

      const obj = JSON.parse(text)

      if (isPianoNotesClipboardData(obj)) {
        pasteSelection(rootStore)()
      } else if (isControlEventsClipboardData(obj)) {
        pasteControlSelection(rootStore)()
      }
    }

    document.addEventListener("paste", onPaste)
    return () => {
      document.onpaste = null
    }
  }, [rootStore])

  return <></>
}
