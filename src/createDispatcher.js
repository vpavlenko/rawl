import createSongAction from "./actions/song"
import createTrackAction from "./actions/track"
import createPlayerAction from "./actions/player"
import createHistoryAction from "./actions/history"
import creatQuantizerAction from "./actions/quantizer"
import createSelectionAction from "./actions/selection"
import createTrackMuteAction from "./actions/trackMute"
import createPianoRollAction from "./actions/pianoRoll"

export default (rootStore) => function dispatch(type, params) {
  const actions = {
    ...createSongAction(rootStore),
    ...createTrackAction(rootStore),
    ...createPlayerAction(rootStore),
    ...createHistoryAction(rootStore),
    ...creatQuantizerAction(rootStore),
    ...createSelectionAction(rootStore),
    ...createTrackMuteAction(rootStore),
    ...createPianoRollAction(rootStore),
  }

  const action = actions[type]
  if (action) {
    return action(params)
  }

  console.warn("unknown action", type, params)
}
