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

  document.oncopy = () => {
    dispatch("COPY_SELECTION")
  }

  document.onpaste = () => {
    dispatch("PASTE_SELECTION")
  }
}