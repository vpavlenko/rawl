import React, { FC, useEffect } from "react"
import {
  copySelection,
  pasteSelection,
  deleteSelection,
  play,
  stop,
  transposeSelection,
} from "main/actions"
import { useStores } from "../hooks/useStores"

const isFocusable = (e: EventTarget) =>
  e instanceof HTMLAnchorElement ||
  e instanceof HTMLAreaElement ||
  e instanceof HTMLInputElement ||
  e instanceof HTMLSelectElement ||
  e instanceof HTMLTextAreaElement ||
  e instanceof HTMLButtonElement ||
  e instanceof HTMLIFrameElement

export const KeyboardShortcut: FC = () => {
  const { rootStore } = useStores()
  const {
    services: { player },
  } = rootStore

  useEffect(() => {
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
          transposeSelection(rootStore)(1)
          break
        }
        case "ArrowDown": {
          transposeSelection(rootStore)(-1)
          break
        }
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
    return () => {
      document.onkeydown = null
      document.oncut = null
      document.oncopy = null
      document.onpaste = null
    }
  })

  return <></>
}
