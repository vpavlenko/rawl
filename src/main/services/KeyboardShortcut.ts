import {
  UNDO,
  REDO,
  copySelection,
  pasteSelection,
  deleteSelection,
} from "main/actions"
import RootStore from "../stores/RootStore"

export function bindKeyboardShortcut({
  dispatch,
  dispatch2,
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
          dispatch(UNDO)
        }
        break
      }
      case "KeyY": {
        if (e.ctrlKey) {
          dispatch(REDO)
        }
        break
      }
      default:
        break
    }
  }
  document.oncut = () => {
    dispatch2(copySelection())
    dispatch2(deleteSelection())
  }
  document.oncopy = () => {
    dispatch2(copySelection())
  }
  document.onpaste = () => {
    dispatch2(pasteSelection())
  }
}
