import { compose } from "recompose"
import { inject, observer } from "mobx-react"
import RootStore from "stores/RootStore"
import { SET_QUANTIZE_DENOMINATOR } from "actions"
import {
  PianoRollToolbarProps,
  PianoRollToolbar
} from "components/PianoRollToolbar/PianoRollToolbar"

export default compose(
  inject(
    ({
      rootStore: {
        services: { quantizer },
        pianoRollStore: s,
        dispatch
      }
    }: {
      rootStore: RootStore
    }) =>
      ({
        quantize: s.quantize === 0 ? quantizer.denominator : s.quantize,
        mouseMode: s.mouseMode,
        autoScroll: s.autoScroll,
        onClickPencil: () => (s.mouseMode = "pencil"),
        onClickSelection: () => (s.mouseMode = "selection"),
        onClickAutoScroll: () => (s.autoScroll = !s.autoScroll),
        onSelectQuantize: e => {
          dispatch(SET_QUANTIZE_DENOMINATOR, e.denominator)
          s.quantize = e.denominator
        }
      } as PianoRollToolbarProps)
  ),
  observer
)(PianoRollToolbar)
