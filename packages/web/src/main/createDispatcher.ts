import createSongAction from "./actions/song"
import createTrackAction from "./actions/track"
import createPlayerAction from "./actions/player"
import createHistoryAction from "./actions/history"
import createRootViewAction from "./actions/rootView"
import creatQuantizerAction from "./actions/quantizer"
import createSelectionAction from "./actions/selection"
import createTrackMuteAction from "./actions/trackMute"
import createPianoRollAction from "./actions/pianoRoll"
import createArrangeViewAction from "./actions/arrangeView"

export type Dispatcher = (type: symbol, params?: any) => void

const createDispatcher = rootStore => (
  type: symbol,
  params?: any
): Dispatcher => {
  const actions = {
    ...createSongAction(rootStore),
    ...createTrackAction(rootStore),
    ...createPlayerAction(rootStore),
    ...createHistoryAction(rootStore),
    ...createRootViewAction(rootStore),
    ...creatQuantizerAction(rootStore),
    ...createSelectionAction(rootStore),
    ...createTrackMuteAction(rootStore),
    ...createPianoRollAction(rootStore),
    ...createArrangeViewAction(rootStore)
  }

  const action = actions[type]
  if (action) {
    return action(params)
  }

  console.warn("unknown action", type, params)
}

export default createDispatcher
