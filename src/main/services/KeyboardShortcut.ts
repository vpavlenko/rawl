import {
  copySelection,
  pasteSelection,
  deleteSelection,
  undo,
  redo,
} from "main/actions"
import RootStore from "../stores/RootStore"

export function bindKeyboardShortcut({
  dispatch,
  services: { player },
  song,
}: RootStore) {
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
          dispatch(undo())
        }
        break
      }
      case "KeyY": {
        if (e.ctrlKey) {
          dispatch(redo())
        }
        break
      }
      default:
        break
    }
  }
  document.oncut = () => {
    dispatch(copySelection())
    dispatch(deleteSelection())
  }
  document.oncopy = () => {
    dispatch(copySelection())
  }
  document.onpaste = () => {
    dispatch(pasteSelection())
  }
}
