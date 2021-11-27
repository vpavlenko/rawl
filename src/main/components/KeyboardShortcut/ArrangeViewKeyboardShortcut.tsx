import { FC, useEffect } from "react"
import {
  arrangeCopySelection,
  arrangeDeleteSelection,
  arrangePasteSelection,
  arrangeResetSelection,
} from "../../actions"
import { useStores } from "../../hooks/useStores"
import { isFocusable } from "./isFocusable"

const SCROLL_DELTA = 24

export const ArrangeViewKeyboardShortcut: FC = () => {
  const rootStore = useStores()

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.target !== null && isFocusable(e.target)) {
        return
      }
      switch (e.code) {
        case "Escape": {
          arrangeResetSelection(rootStore)()
          break
        }
        case "Delete":
        case "Backspace": {
          arrangeDeleteSelection(rootStore)()
          break
        }
        case "ArrowUp": {
          if (e.ctrlKey || e.metaKey) {
            rootStore.arrangeViewStore.scrollBy(0, SCROLL_DELTA)
          }
          break
        }
        case "ArrowDown": {
          if (e.ctrlKey || e.metaKey) {
            rootStore.arrangeViewStore.scrollBy(0, -SCROLL_DELTA)
          }
          break
        }
        default:
          // do not call preventDefault
          return
      }
      e.preventDefault()
    }

    window.addEventListener("keydown", listener)

    document.oncut = () => {
      arrangeCopySelection(rootStore)()
      arrangeDeleteSelection(rootStore)()
    }
    document.oncopy = () => {
      arrangeCopySelection(rootStore)()
    }
    document.onpaste = () => {
      arrangePasteSelection(rootStore)()
    }
    return () => {
      window.removeEventListener("keydown", listener)

      document.onkeydown = null
      document.oncut = null
      document.oncopy = null
      document.onpaste = null
    }
  }, [rootStore])

  return <></>
}
