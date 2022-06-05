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

type Action = {
  code: KeyboardEvent["code"]
  metaKey?: boolean
  shiftKey?: boolean
  run: () => void
}

export const GlobalKeyboardShortcut: FC = () => {
  const rootStore = useStores()

  const actions: Action[] = [
    { code: "Space", run: playOrPause(rootStore) },
    { code: "KeyZ", metaKey: true, shiftKey: true, run: redo(rootStore) },
    { code: "KeyZ", metaKey: true, shiftKey: false, run: undo(rootStore) },
    { code: "KeyY", metaKey: true, run: redo(rootStore) },
    // Press ?
    {
      code: "Slash",
      shiftKey: true,
      run: () => (rootStore.rootViewStore.openHelp = true),
    },
    { code: "Enter", run: stop(rootStore) },
    { code: "KeyA", run: rewindOneBar(rootStore) },
    { code: "KeyD", run: fastForwardOneBar(rootStore) },
    { code: "KeyS", run: nextTrack(rootStore) },
    { code: "KeyW", run: previousTrack(rootStore) },
    { code: "KeyN", run: toggleSolo(rootStore) },
    { code: "KeyM", run: toggleMute(rootStore) },
    { code: "Comma", run: toggleGhost(rootStore) },
  ]

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.target !== null && isFocusable(e.target)) {
        return
      }
      const action = actions.find(
        (action) =>
          e.code === action.code &&
          e.shiftKey === (action.shiftKey ?? false) &&
          (e.ctrlKey || e.metaKey) === (action.metaKey ?? false)
      )
      if (action !== undefined) {
        action.run()
        e.preventDefault()
      }
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
