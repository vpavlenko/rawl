import { FC, useEffect } from "react"
import { play, stop } from "../../actions"
import { redo, undo } from "../../actions/history"
import { useStores } from "../../hooks/useStores"

const isFocusable = (e: EventTarget) =>
  e instanceof HTMLAnchorElement ||
  e instanceof HTMLAreaElement ||
  e instanceof HTMLInputElement ||
  e instanceof HTMLSelectElement ||
  e instanceof HTMLTextAreaElement ||
  e instanceof HTMLButtonElement ||
  e instanceof HTMLIFrameElement

export const GlobalKeyboardShortcut: FC = () => {
  const rootStore = useStores()

  useEffect(() => {
    const {
      services: { player },
    } = rootStore

    const listener = (e: KeyboardEvent) => {
      if (e.target !== null && isFocusable(e.target)) {
        return
      }
      switch (e.code) {
        case "Space": {
          if (player.isPlaying) {
            stop(rootStore)()
          } else {
            play(rootStore)()
          }
          break
        }
        case "KeyZ": {
          if (e.ctrlKey || e.metaKey) {
            if (e.shiftKey) {
              redo(rootStore)()
            } else {
              undo(rootStore)()
            }
          }
          break
        }
        case "KeyY": {
          if (e.ctrlKey || e.metaKey) {
            redo(rootStore)()
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

    // do not allow to open the default context menu
    document.oncontextmenu = (e) => e.preventDefault()

    return () => {
      window.removeEventListener("keydown", listener)
      document.oncontextmenu = null
    }
  }, [rootStore])

  return <></>
}
