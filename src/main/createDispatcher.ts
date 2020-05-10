import createSongAction, { SongAction } from "./actions/song"
import createTrackAction from "./actions/track"
import createPlayerAction, { PlayerAction } from "./actions/player"
import createHistoryAction from "./actions/history"
import createRootViewAction from "./actions/rootView"
import creatQuantizerAction, { QuantizerAction } from "./actions/quantizer"
import createSelectionAction from "./actions/selection"
import createTrackMuteAction from "./actions/trackMute"
import createPianoRollAction from "./actions/pianoRoll"
import createArrangeViewAction from "./actions/arrangeView"
import RootStore from "./stores/RootStore"

export type Dispatcher = (type: symbol, ...params: any) => any
export type Mutator = (store: RootStore) => void

const createDispatcher = (rootStore: RootStore) => (
  type: symbol,
  ...params: any
): Dispatcher => {
  const actions: any = {
    ...createTrackAction(rootStore),
    ...createHistoryAction(rootStore),
    ...createRootViewAction(rootStore),
    ...createSelectionAction(rootStore),
    ...createTrackMuteAction(rootStore),
    ...createPianoRollAction(rootStore),
    ...createArrangeViewAction(rootStore),
  }
  const action = actions[type]
  if (action) {
    return action(...params)
  }

  console.warn("unknown action", type, params)
  return () => {}
}

export type Action = PlayerAction | QuantizerAction | SongAction

export const createDispatcher2 = (rootStore: RootStore) => (action: Action) => {
  const mutators = [createPlayerAction, creatQuantizerAction, createSongAction]
  for (let m of mutators) {
    const mutator = m(action)
    if (mutator !== null) {
      mutator(rootStore)
      break
    }
  }
}

export default createDispatcher
