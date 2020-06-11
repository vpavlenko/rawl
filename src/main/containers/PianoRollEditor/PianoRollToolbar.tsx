import React, { useCallback } from "react"
import { useObserver } from "mobx-react"
import { PianoRollToolbar } from "components/PianoRollToolbar/PianoRollToolbar"
import { setTrackVolume, setTrackPan } from "main/actions"
import { useStores } from "main/hooks/useStores"

const PianoRollToolbarWrapper = () => {
  const { rootStore: stores } = useStores()
  const {
    mouseMode,
    autoScroll,
    trackName,
    instrumentName,
    pan,
    volume,
    track,
    trackId,
    quantize,
  } = useObserver(() => ({
    trackName: stores.song.selectedTrack?.displayName ?? "",
    instrumentName: stores.song.selectedTrack?.instrumentName ?? "",
    pan: stores.song.selectedTrack?.pan ?? 0,
    volume: stores.song.selectedTrack?.volume ?? 0,
    track: stores.song.selectedTrack,
    trackId: stores.song.selectedTrackId,
    quantize:
      stores.pianoRollStore.quantize === 0
        ? stores.services.quantizer.denominator
        : stores.pianoRollStore.quantize,
    autoScroll: stores.pianoRollStore.autoScroll,
    mouseMode: stores.pianoRollStore.mouseMode,
  }))
  const { rootViewStore, pianoRollStore: s } = stores

  const onChangeVolume = useCallback(
    (value: number) => setTrackVolume(stores)(trackId, value),
    [stores, trackId]
  )
  const onChangePan = useCallback(
    (value: number) => setTrackPan(stores)(trackId, value),
    [stores, trackId]
  )

  if (track === undefined) {
    return <></>
  }

  return (
    <PianoRollToolbar
      trackName={trackName}
      instrumentName={instrumentName}
      pan={pan}
      volume={volume}
      quantize={quantize}
      mouseMode={mouseMode}
      autoScroll={autoScroll}
      onClickPencil={() => (s.mouseMode = "pencil")}
      onClickSelection={() => (s.mouseMode = "selection")}
      onClickAutoScroll={() => (s.autoScroll = !s.autoScroll)}
      onSelectQuantize={(e) => {
        stores.services.quantizer.denominator = e.denominator
        s.quantize = e.denominator
      }}
      onChangeVolume={onChangeVolume}
      onChangePan={onChangePan}
      onClickNavBack={() => (rootViewStore.openDrawer = true)}
      onClickInstrument={() => {
        if (track === undefined) {
          return
        }
        const programNumber = track.programNumber
        s.instrumentBrowserSetting = {
          isRhythmTrack: track.isRhythmTrack,
          programNumber: programNumber ?? 0,
        }
        s.openInstrumentBrowser = true
      }}
    />
  )
}

export default PianoRollToolbarWrapper
