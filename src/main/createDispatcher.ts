import createSongAction, { SongAction } from "./actions/song"
import createTrackAction, { TrackAction } from "./actions/track"
import createRootViewAction from "./actions/rootView"
import creatQuantizerAction, { QuantizerAction } from "./actions/quantizer"
import createSelectionAction, { SelectionAction } from "./actions/selection"
import createArrangeViewAction, {
  ArrangeViewAction,
} from "./actions/arrangeView"
import RootStore from "./stores/RootStore"

export type Dispatcher = (action: Action) => any
export type Mutator = (store: RootStore) => void

export type Action =
  | QuantizerAction
  | SongAction
  | SelectionAction
  | ArrangeViewAction
  | TrackAction

export const createDispatcher2 = (rootStore: RootStore): Dispatcher => (
  action
) => {
  const mutators = [
    creatQuantizerAction,
    createSongAction,
    createSelectionAction,
    createArrangeViewAction,
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
