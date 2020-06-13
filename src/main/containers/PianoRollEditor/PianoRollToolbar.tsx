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
  const onClickPencil = useCallback(() => (s.mouseMode = "pencil"), [])
  const onClickSelection = useCallback(() => (s.mouseMode = "selection"), [])
  const onClickAutoScroll = useCallback(
    () => (s.autoScroll = !s.autoScroll),
    []
  )
  const onSelectQuantize = useCallback((denominator: number) => {
    stores.services.quantizer.denominator = denominator
    s.quantize = denominator
  }, [])
  const onClickNavBack = useCallback(
    () => (rootViewStore.openDrawer = true),
    []
  )
  const onClickInstrument = useCallback(() => {
    if (track === undefined) {
      return
    }
    const programNumber = track.programNumber
    s.instrumentBrowserSetting = {
      isRhythmTrack: track.isRhythmTrack,
      programNumber: programNumber ?? 0,
    }
    s.openInstrumentBrowser = true
  }, [])

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
      onClickPencil={onClickPencil}
      onClickSelection={onClickSelection}
      onClickAutoScroll={onClickAutoScroll}
      onSelectQuantize={onSelectQuantize}
      onChangeVolume={onChangeVolume}
      onChangePan={onChangePan}
      onClickNavBack={onClickNavBack}
      onClickInstrument={onClickInstrument}
    />
  )
}

export default PianoRollToolbarWrapper
