import RootStore from "../stores/RootStore"

export const pushHistory = (rootStore: RootStore) => () => {
  const state = rootStore.serialize()
  rootStore.historyStore.push(state)
}

export const undo = (rootStore: RootStore) => () => {
  const currentState = rootStore.serialize()
  const nextState = rootStore.historyStore.undo(currentState)
  if (nextState !== undefined) {
    rootStore.restore(nextState)
  }
}

export const redo = (rootStore: RootStore) => () => {
  const currentState = rootStore.serialize()
  const nextState = rootStore.historyStore.redo(currentState)
  if (nextState !== undefined) {
    rootStore.restore(nextState)
  }
}
