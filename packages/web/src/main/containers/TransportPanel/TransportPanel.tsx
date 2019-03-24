import { TIME_BASE } from "Constants"
import {
  MOVE_PLAYER_POSITION,
  PLAY,
  SELECT_TRACK,
  STOP,
  TOGGLE_ENABLE_LOOP
} from "main/actions"
import { inject, observer } from "mobx-react"
import { compose } from "recompose"
import withMBTTime from "components/TransportPanel/withMBTTime"
import {
  TransportPanel,
  TransportPanelProps
} from "components/TransportPanel/TransportPanel"
import RootStore from "stores/RootStore"

export default compose(
  inject(
    ({
      rootStore: {
        services: { player },
        song: { measureList },
        playerStore: { loop },
        router,
        dispatch
      }
    }: {
      rootStore: RootStore
    }) =>
      ({
        player,
        tempo: player.currentTempo,
        measureList,
        loopEnabled: loop.enabled,
        onClickPlay: () => dispatch(PLAY),
        onClickStop: () => dispatch(STOP),
        onClickBackward: () => dispatch(MOVE_PLAYER_POSITION, -TIME_BASE * 4),
        onClickForward: () => dispatch(MOVE_PLAYER_POSITION, TIME_BASE * 4),
        onClickEnableLoop: () => dispatch(TOGGLE_ENABLE_LOOP),
        onClickTempo: () => {
          dispatch(SELECT_TRACK, 0)
          router.pushTrack()
        }
      } as Partial<TransportPanelProps>)
  ),
  observer,
  withMBTTime
)(TransportPanel)
