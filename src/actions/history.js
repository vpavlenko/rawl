
export default (rootStore) => {
  return {
    "UNDO": () => {
      rootStore.undo()
    },

    "REDO": () => {
      rootStore.redo()
    }
  }
}