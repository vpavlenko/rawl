import createSongAction from "./actions/song"
import createTrackAction from "./actions/track"
import createPlayerAction from "./actions/player"
import createHistoryAction from "./actions/history"
import creatQuantizerAction from "./actions/quantizer"
import createSelectionAction from "./actions/selection"
import createTrackMuteAction from "./actions/trackMute"

export default (app, history) => function dispatch(type, params) {
  const actions = {
    ...createSongAction(app, history),
    ...createTrackAction(app, history),
    ...createPlayerAction(app),
    ...createHistoryAction(history),
    ...creatQuantizerAction(app),
    ...createSelectionAction(app, dispatch),
    ...createTrackMuteAction(app)
  }

  const action = actions[type]
  if (action) {
    return action(params)
  }

  console.warn("unknown action", type, params)
}
