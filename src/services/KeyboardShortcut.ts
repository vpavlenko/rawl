export function bindKeyboardShortcut(dispatch, player, songStore) {
  document.onkeydown = e => {
    if (e.target !== document.body) {
      return
    }
    switch (e.code) {
      case "Space": {
        if (player.isPlaying) {
          player.stop()
        } else {
          player.play(songStore.song)
        }
        e.preventDefault()
        break
      }
      case "KeyZ": {
        if (e.ctrlKey) {
          dispatch("UNDO")
        }
        break
      }
      case "KeyY": {
        if (e.ctrlKey) {
          dispatch("REDO")
        }
        break
      }
      default: break
    }
  }

  (document as any).oncut = () => {
    dispatch("COPY_SELECTION")
    dispatch("DELETE_SELECTION")
  }

  (document as any).oncopy = () => {
    dispatch("COPY_SELECTION")
  }

  (document as any).onpaste = () => {
    dispatch("PASTE_SELECTION")
  }
}