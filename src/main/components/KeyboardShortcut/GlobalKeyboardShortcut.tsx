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
  toggleRecording,
  toggleSolo,
} from "../../actions"
import { redo, undo } from "../../actions/history"
import { useStores } from "../../hooks/useStores"
import { KeyboardShortcut } from "./KeyboardShortcut"

export const GlobalKeyboardShortcut: FC = () => {
  const rootStore = useStores()
  const { rootViewStore, router } = rootStore

  useEffect(() => {
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
      document.removeEventListener("wheel", onWheel)
      document.removeEventListener("touchmove", onTouchMove)
      document.oncontextmenu = null
    }
  }, [])

  return (
    <KeyboardShortcut
      actions={[
        { code: "Space", run: () => playOrPause(rootStore)() },
        {
          code: "KeyZ",
          metaKey: true,
          shiftKey: true,
          run: () => redo(rootStore)(),
        },
        {
          code: "KeyZ",
          metaKey: true,
          shiftKey: false,
          run: () => undo(rootStore)(),
        },
        { code: "KeyY", metaKey: true, run: () => redo(rootStore)() },
        {
          // Press ?
          code: "Slash",
          shiftKey: true,
          run: () => (rootViewStore.openHelp = true),
        },
        { code: "Enter", run: () => stop(rootStore)() },
        { code: "KeyA", run: () => rewindOneBar(rootStore)() },
        { code: "KeyD", run: () => fastForwardOneBar(rootStore)() },
        { code: "KeyS", run: () => nextTrack(rootStore)() },
        { code: "KeyW", run: () => previousTrack(rootStore)() },
        { code: "KeyN", run: () => toggleSolo(rootStore)() },
        { code: "KeyM", run: () => toggleMute(rootStore)() },
        { code: "KeyR", run: () => toggleRecording(rootStore)() },
        { code: "Comma", run: () => toggleGhost(rootStore)() },
        {
          code: "Digit1",
          metaKey: true,
          run: () => (router.path = "/track"),
        },
        {
          code: "Digit2",
          metaKey: true,
          run: () => (router.path = "/arrange"),
        },
        {
          code: "Digit3",
          metaKey: true,
          run: () => (router.path = "/tempo"),
        },
      ]}
    />
  )
}
