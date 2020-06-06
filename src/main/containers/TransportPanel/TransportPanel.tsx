import React, { SFC } from "react"
import { TIME_BASE } from "Constants"
import {
  play,
  stop,
  movePlayerPosition,
  toggleEnableLoop,
  selectTrack,
} from "main/actions"
import { useObserver } from "mobx-react"
import TransportPanel from "components/TransportPanel/TransportPanel"
import { useStores } from "main/hooks/useStores"
import { getMBTString } from "common/measure/mbt"

const TransportPanelWrapper: SFC<{}> = () => {
  const { rootStore: stores } = useStores()
  const { tempo, dispatch, router, loop, mbtTime } = useObserver(() => ({
    tempo: stores.services.player.currentTempo,
    router: stores.router,
    dispatch: stores.dispatch,
    player: stores.services.player,
    loop: stores.playerStore.loop,
    mbtTime: getMBTString(
      stores.song.measures,
      stores.playerStore.position,
      stores.services.player.timebase
    ),
  }))
  return (
    <TransportPanel
      mbtTime={mbtTime}
      tempo={tempo}
      loopEnabled={loop.enabled}
      onClickPlay={() => play(stores)()}
      onClickStop={() => stop(stores)()}
      onClickBackward={() => movePlayerPosition(stores)(-TIME_BASE * 4)}
      onClickForward={() => movePlayerPosition(stores)(TIME_BASE * 4)}
      onClickEnableLoop={() => toggleEnableLoop(stores)()}
      onClickTempo={() => {
        dispatch(selectTrack(0))
        router.pushTrack()
      }}
    />
  )
}

export default TransportPanelWrapper
