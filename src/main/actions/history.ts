import RootStore from "../stores/RootStore"

export const UNDO = Symbol()
export const REDO = Symbol()

export default (rootStore: RootStore) => {
  return {
    [UNDO]: () => {
      rootStore.undo()
    },

    [REDO]: () => {
      rootStore.redo()
    }
  }
}
