import { compose } from "recompose"
import { inject, observer } from "mobx-react"
import RootStore from "stores/RootStore"
import {
  PianoRollToolbarProps,
  PianoRollToolbar,
} from "components/PianoRollToolbar/PianoRollToolbar"
import {
  setQuantizeDenominator,
  setTrackVolume,
  setTrackPan,
} from "main/actions"

export default compose(
  inject(
    ({
      rootStore: {
        song,
        dispatch2,
        pianoRollStore: s,
        rootViewStore,
        services: { quantizer },
      },
    }: {
      rootStore: RootStore
    }) => {
      const track = song.selectedTrack
      const trackId = song.selectedTrackId
      return {
        track,
        quantize: s.quantize === 0 ? quantizer.denominator : s.quantize,
        mouseMode: s.mouseMode,
        autoScroll: s.autoScroll,
        onClickPencil: () => (s.mouseMode = "pencil"),
        onClickSelection: () => (s.mouseMode = "selection"),
        onClickAutoScroll: () => (s.autoScroll = !s.autoScroll),
        onSelectQuantize: (e) => {
          dispatch2(setQuantizeDenominator(e.denominator))
          s.quantize = e.denominator
        },
        onChangeVolume: (value) => dispatch2(setTrackVolume(trackId, value)),
        onChangePan: (value) => dispatch2(setTrackPan(trackId, value)),
        onClickNavBack: () => (rootViewStore.openDrawer = true),
        onClickInstrument: () => {
          if (track === undefined) {
            return
          }
          const programNumber = track.programNumber
          s.instrumentBrowserSetting = {
            isRhythmTrack: track.isRhythmTrack,
            programNumber: programNumber ?? 0,
          }
          s.openInstrumentBrowser = true
        },
      } as PianoRollToolbarProps
    }
  ),
  observer
)(PianoRollToolbar)
