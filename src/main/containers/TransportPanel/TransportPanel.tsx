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
  const { tempo, router, loop, mbtTime } = useObserver(() => ({
    tempo: stores.song.conductorTrack?.tempo ?? 0,
    router: stores.router,
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
      onChangeTempo={(tempo) => {
        stores.song.conductorTrack?.setTempo(tempo)
      }}
    />
  )
}

export default TransportPanelWrapper
