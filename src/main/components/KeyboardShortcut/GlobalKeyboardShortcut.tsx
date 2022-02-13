import { FC, useEffect } from "react"
import {
  fastForwardOneBar,
  nextTrack,
  playOrPause,
  previousTrack,
  rewindOneBar,
  stop,
  toggleGhost,
  toggleMute,
  toggleSolo,
} from "../../actions"
import { redo, undo } from "../../actions/history"
import { useStores } from "../../hooks/useStores"
import { isFocusable } from "./isFocusable"

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
          playOrPause(rootStore)()
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
        case "Slash": {
          // Press ?
          if (e.shiftKey) {
            rootStore.rootViewStore.openHelp = true
          }
          break
        }
        case "Enter": {
          stop(rootStore)()
          break
        }
        case "KeyA": {
          rewindOneBar(rootStore)()
          return
        }
        case "KeyD": {
          fastForwardOneBar(rootStore)()
          return
        }
        case "KeyS": {
          nextTrack(rootStore)()
          return
        }
        case "KeyW": {
          previousTrack(rootStore)()
          return
        }
        case "KeyN": {
          toggleSolo(rootStore)()
          return
        }
        case "KeyM": {
          toggleMute(rootStore)()
          return
        }
        case "Comma": {
          toggleGhost(rootStore)()
          return
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
