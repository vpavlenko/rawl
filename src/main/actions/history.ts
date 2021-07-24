import cloneDeep from "lodash/cloneDeep"
import { deserialize, serialize } from "serializr"
import { Selection } from "../../common/selection/Selection"
import Song from "../../common/song/Song"
import RootStore from "../stores/RootStore"

// we use any for now. related: https://github.com/Microsoft/TypeScript/issues/1897
type Json = any

export interface SerializedState {
  song: Json
  selection: Selection | null
  selectedControllerEventIds: number[]
}

const serializeUndoableState = (rootStore: RootStore): SerializedState => {
  return {
    song: serialize(rootStore.song),
    selection: cloneDeep(rootStore.pianoRollStore.selection),
    selectedControllerEventIds:
      rootStore.pianoRollStore.selectedControllerEventIds,
  }
}

const restoreState =
  (rootStore: RootStore) => (serializedState: SerializedState) => {
    const song = deserialize(Song, serializedState.song)
    rootStore.song = song
    rootStore.pianoRollStore.selection = serializedState.selection
    rootStore.pianoRollStore.selectedControllerEventIds =
      serializedState.selectedControllerEventIds
  }

export const pushHistory = (rootStore: RootStore) => () => {
  const state = serializeUndoableState(rootStore)
  rootStore.historyStore.push(state)
}

export const undo = (rootStore: RootStore) => () => {
  const currentState = serializeUndoableState(rootStore)
  const nextState = rootStore.historyStore.undo(currentState)
  if (nextState !== undefined) {
    restoreState(rootStore)(nextState)
  }
}

export const redo = (rootStore: RootStore) => () => {
  const currentState = serializeUndoableState(rootStore)
  const nextState = rootStore.historyStore.redo(currentState)
  if (nextState !== undefined) {
    restoreState(rootStore)(nextState)
  }
}
