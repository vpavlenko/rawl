import { copySelection, pasteSelection, deleteSelection } from "main/actions"
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
          player.stop()
        } else {
          player.play(song)
        }
        e.preventDefault()
        break
      }
      case "KeyZ": {
        if (e.ctrlKey) {
          rootStore.undo()
        }
        break
      }
      case "KeyY": {
        if (e.ctrlKey) {
          rootStore.redo()
        }
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
