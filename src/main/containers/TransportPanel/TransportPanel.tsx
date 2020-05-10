import { TIME_BASE } from "Constants"
import {
  play,
  stop,
  movePlayerPosition,
  toggleEnableLoop,
  selectTrack,
} from "main/actions"
import { inject, observer } from "mobx-react"
import { compose } from "recompose"
import withMBTTime from "components/TransportPanel/withMBTTime"
import TransportPanel, {
  TransportPanelProps,
} from "components/TransportPanel/TransportPanel"
import RootStore from "stores/RootStore"

export default compose(
  inject(
    ({
      rootStore: {
        services: { player },
        song: { measures },
        playerStore: { loop },
        router,
        dispatch,
      },
    }: {
      rootStore: RootStore
    }) =>
      ({
        player,
        tempo: player.currentTempo,
        measures,
        loopEnabled: loop.enabled,
        onClickPlay: () => dispatch(play()),
        onClickStop: () => dispatch(stop()),
        onClickBackward: () => dispatch(movePlayerPosition(-TIME_BASE * 4)),
        onClickForward: () => dispatch(movePlayerPosition(TIME_BASE * 4)),
        onClickEnableLoop: () => dispatch(toggleEnableLoop()),
        onClickTempo: () => {
          dispatch(selectTrack(0))
          router.pushTrack()
        },
      } as Partial<TransportPanelProps>)
  ),
  observer,
  withMBTTime
)(TransportPanel)
