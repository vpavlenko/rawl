import createSongAction from "./actions/song"
import createTrackAction from "./actions/track"
import createPlayerAction from "./actions/player"
import createHistoryAction from "./actions/history"
import creatQuantizerAction from "./actions/quantizer"
import createTrackMuteAction from "./actions/trackMute"

const dispatch = (app, history) => (type, params) => {
  const actions = {
    ...createSongAction(app, history),
    ...createTrackAction(app, history),
    ...createPlayerAction(app),
    ...createHistoryAction(history),
    ...creatQuantizerAction(app),
    ...createTrackMuteAction(app)
  }

  const action = actions[type]
  if (action) {
    return action(params)
  }

  console.warn("unknown action", type, params)
}

export default dispatch
