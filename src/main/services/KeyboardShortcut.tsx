import React, { FC, useEffect } from "react"
import {
  copySelection,
  deleteSelection,
  pasteSelection,
  play,
  selectNextNote,
  selectPreviousNote,
  stop,
  transposeSelection,
} from "../actions"
import { useStores } from "../hooks/useStores"

const isFocusable = (e: EventTarget) =>
  e instanceof HTMLAnchorElement ||
  e instanceof HTMLAreaElement ||
  e instanceof HTMLInputElement ||
  e instanceof HTMLSelectElement ||
  e instanceof HTMLTextAreaElement ||
  e instanceof HTMLButtonElement ||
  e instanceof HTMLIFrameElement

const SCROLL_DELTA = 24

export const KeyboardShortcut: FC = () => {
  const { rootStore } = useStores()

  useEffect(() => {
    const {
      services: { player },
    } = rootStore

    document.onkeydown = (e) => {
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
              rootStore.redo()
            } else {
              rootStore.undo()
            }
          }
          break
        }
        case "KeyY": {
          if (e.ctrlKey || e.metaKey) {
            rootStore.redo()
          }
          break
        }
        case "Delete":
        case "Backspace": {
          deleteSelection(rootStore)()
          break
        }
        case "Digit1": {
          rootStore.pianoRollStore.mouseMode = "pencil"
          break
        }
        case "Digit2": {
          rootStore.pianoRollStore.mouseMode = "selection"
          break
        }
        case "ArrowUp": {
          if (e.ctrlKey || e.metaKey) {
            rootStore.pianoRollStore.scrollBy(0, SCROLL_DELTA)
          } else {
            transposeSelection(rootStore)(1)
          }
          break
        }
        case "ArrowDown": {
          if (e.ctrlKey || e.metaKey) {
            rootStore.pianoRollStore.scrollBy(0, -SCROLL_DELTA)
          } else {
            transposeSelection(rootStore)(-1)
          }
          break
        }
        case "ArrowRight":
          if (e.ctrlKey || e.metaKey) {
            rootStore.pianoRollStore.scrollBy(-SCROLL_DELTA, 0)
          } else if (rootStore.pianoRollStore.mouseMode == "pencil") {
            selectNextNote(rootStore)()
          }
          break
        case "ArrowLeft":
          if (e.ctrlKey || e.metaKey) {
            rootStore.pianoRollStore.scrollBy(SCROLL_DELTA, 0)
          } else if (rootStore.pianoRollStore.mouseMode == "pencil") {
            selectPreviousNote(rootStore)()
          }
          break
        default:
          // do not call preventDefault
          return
      }
      e.preventDefault()
    }
    document.oncut = () => {
      copySelection(rootStore)()
      deleteSelection(rootStore)()
    }
    document.oncopy = () => {
      copySelection(rootStore)()
    }
    document.onpaste = () => {
      pasteSelection(rootStore)()
    }
    document.oncontextmenu = (e) => e.preventDefault()
    return () => {
      document.onkeydown = null
      document.oncut = null
      document.oncopy = null
      document.onpaste = null
      document.oncontextmenu = null
    }
  }, [rootStore])

  return <></>
}
