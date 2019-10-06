import { compose } from "recompose"
import { inject, observer } from "mobx-react"
import RootStore from "stores/RootStore"
import {
  PianoRollToolbarProps,
  PianoRollToolbar
} from "components/PianoRollToolbar/PianoRollToolbar"
import {
  SET_TRACK_VOLUME,
  SET_TRACK_PAN,
  SET_TRACK_INSTRUMENT,
  SET_QUANTIZE_DENOMINATOR
} from "main/actions"

import { show as showInstrumentBrowser } from "components/InstrumentBrowser/InstrumentBrowser"

export default compose(
  inject(
    ({
      rootStore: {
        song,
        router,
        dispatch,
        pianoRollStore: s,
        services: { quantizer }
      }
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
        onSelectQuantize: e => {
          dispatch(SET_QUANTIZE_DENOMINATOR, e.denominator)
          s.quantize = e.denominator
        },
        onChangeVolume: value => dispatch(SET_TRACK_VOLUME, trackId, value),
        onChangePan: value => dispatch(SET_TRACK_PAN, trackId, value),
        onClickNavBack: () => router.pushArrange(),
        onClickInstrument: () =>
          showInstrumentBrowser(song, trackId, (trackId, programNumber) =>
            dispatch(SET_TRACK_INSTRUMENT, { trackId, programNumber })
          )
      } as PianoRollToolbarProps
    }
  ),
  observer
)(PianoRollToolbar)
