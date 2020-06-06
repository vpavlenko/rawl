import React from "react"
import { useObserver } from "mobx-react"
import { PianoRollToolbar } from "components/PianoRollToolbar/PianoRollToolbar"
import { setTrackVolume, setTrackPan } from "main/actions"
import { useStores } from "main/hooks/useStores"

const PianoRollToolbarWrapper = () => {
  const { rootStore: stores } = useStores()
  const { mouseMode, autoScroll, track, trackId, quantize } = useObserver(
    () => ({
      track: stores.song.selectedTrack,
      trackId: stores.song.selectedTrackId,
      quantize:
        stores.pianoRollStore.quantize === 0
          ? stores.services.quantizer.denominator
          : stores.pianoRollStore.quantize,
      autoScroll: stores.pianoRollStore.autoScroll,
      mouseMode: stores.pianoRollStore.mouseMode,
    })
  )
  const { dispatch, rootViewStore, pianoRollStore: s } = stores

  if (track === undefined) {
    return <></>
  }

  return (
    <PianoRollToolbar
      track={track}
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
      onChangeVolume={(value) => dispatch(setTrackVolume(trackId, value))}
      onChangePan={(value) => dispatch(setTrackPan(trackId, value))}
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
