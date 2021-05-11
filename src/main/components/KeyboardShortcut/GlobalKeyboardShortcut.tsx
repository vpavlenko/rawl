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
        case "Period": {
          // Press ?
          if (e.shiftKey) {
            rootStore.rootViewStore.openHelp = true
          }
        }
        default:
          // do not call preventDefault
          return
      }
      e.preventDefault()
    }

    window.addEventListener("keydown", listener)

    // prevent zooming
    const onWheel = (e: WheelEvent) => {
      // Touchpad pinches are translated into wheel with ctrl event
      if (e.ctrlKey) {
        e.preventDefault()
      }
    }

    document.addEventListener("wheel", onWheel, { passive: false })

    // disable bounce scroll (Safari does not support overscroll-behavior CSS)
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault
    }

    document.addEventListener("touchmove", onTouchMove, { passive: false })

    // do not allow to open the default context menu
    document.oncontextmenu = (e) => e.preventDefault()

    return () => {
      window.removeEventListener("keydown", listener)
      document.removeEventListener("wheel", onWheel)
      document.removeEventListener("touchmove", onTouchMove)

      document.oncontextmenu = null
    }
  }, [rootStore])

  return <></>
}
