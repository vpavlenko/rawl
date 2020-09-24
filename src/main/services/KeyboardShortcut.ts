import {
  copySelection,
  pasteSelection,
  deleteSelection,
  play,
  stop,
} from "main/actions"
import RootStore from "../stores/RootStore"

export function bindKeyboardShortcut(rootStore: RootStore) {
  const {
    services: { player },
    song,
  } = rootStore

  document.onkeydown = (e) => {
    if (e.target !== document.body) {
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
