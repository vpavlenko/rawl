export default ({ pianoRollStore }) => {
  return {
    "TOGGLE_TOOL": () => {
      pianoRollStore.mouseMode = (pianoRollStore.mouseMode === 0 ? 1 : 0)
    }
  }
}
