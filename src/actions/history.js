
export default (history) => {
  return {
    "UNDO": () => history.undo(),
    "REDO": () => history.redo()
  }
}