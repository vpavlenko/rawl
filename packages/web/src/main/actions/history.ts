export const UNDO = Symbol()
export const REDO = Symbol()

export default rootStore => {
  return {
    [UNDO]: () => {
      rootStore.undo()
    },

    [REDO]: () => {
      rootStore.redo()
    }
  }
}
