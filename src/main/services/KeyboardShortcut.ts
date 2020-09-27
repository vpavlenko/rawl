import {
  copySelection,
  pasteSelection,
  deleteSelection,
  play,
  stop,
} from "main/actions"
import RootStore from "../stores/RootStore"

const isFocusable = (e: EventTarget) =>
  e instanceof HTMLAnchorElement ||
  e instanceof HTMLAreaElement ||
  e instanceof HTMLInputElement ||
  e instanceof HTMLSelectElement ||
  e instanceof HTMLTextAreaElement ||
  e instanceof HTMLButtonElement ||
  e instanceof HTMLIFrameElement

export function bindKeyboardShortcut(rootStore: RootStore) {
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
        e.preventDefault()
        break
      }
      case "KeyZ": {
        if (e.ctrlKey || e.metaKey) {
          rootStore.undo()
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
      default:
        break
    }
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
}
