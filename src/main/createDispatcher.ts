import createSongAction, { SongAction } from "./actions/song"
import createTrackAction, { TrackAction } from "./actions/track"
import createPlayerAction, { PlayerAction } from "./actions/player"
import createHistoryAction, { HistoryAction } from "./actions/history"
import createRootViewAction from "./actions/rootView"
import creatQuantizerAction, { QuantizerAction } from "./actions/quantizer"
import createSelectionAction, { SelectionAction } from "./actions/selection"
import createTrackMuteAction, { TrackMuteAction } from "./actions/trackMute"
import createPianoRollAction, { PianoRollAction } from "./actions/pianoRoll"
import createArrangeViewAction, {
  ArrangeViewAction,
} from "./actions/arrangeView"
import RootStore from "./stores/RootStore"

export type Dispatcher = (type: symbol, ...params: any) => any
export type Dispatcher2 = (action: Action) => any
export type Mutator = (store: RootStore) => void

const createDispatcher = (rootStore: RootStore) => (
  type: symbol,
  ...params: any
): Dispatcher => {
  console.warn("unknown action", type, params)
  return () => {}
}

export type Action =
  | PlayerAction
  | QuantizerAction
  | SongAction
  | TrackMuteAction
  | PianoRollAction
  | SelectionAction
  | ArrangeViewAction
  | HistoryAction
  | TrackAction

export const createDispatcher2 = (rootStore: RootStore): Dispatcher2 => (
  action
) => {
  const mutators = [
    createPlayerAction,
    creatQuantizerAction,
    createSongAction,
    createTrackMuteAction,
    createPianoRollAction,
    createSelectionAction,
    createArrangeViewAction,
    createHistoryAction,
    createRootViewAction,
    createTrackAction,
  ]
  for (let m of mutators) {
    const mutator = m(action)
    if (mutator !== null) {
      return mutator(rootStore)
    }
  }
  return null
}

export default createDispatcher
