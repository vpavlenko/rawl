export function bindKeyboardShortcut(dispatch, player) {
  document.onkeydown = e => {
    if (e.target !== document.body) {
      return
    }
    switch (e.code) {
      case "Space": {
        if (player.isPlaying) {
          player.stop()
        } else {
          player.play()
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
}