import {
  ArrangeToolbar,
  ArrangeToolbarProps
} from "components/ArrangeView/ArrangeToolbar"
import { compose } from "recompose"
import { inject, observer } from "mobx-react"
import RootStore from "stores/RootStore"
import { SET_QUANTIZE_DENOMINATOR } from "actions"

export default compose(
  inject(
    ({
      rootStore: {
        services: { quantizer },
        arrangeViewStore: s,
        dispatch
      }
    }: {
      rootStore: RootStore
    }) =>
      ({
        quantize: s.quantize === 0 ? quantizer.denominator : s.quantize,
        autoScroll: s.autoScroll,
        onClickAutoScroll: () => (s.autoScroll = !s.autoScroll),
        onSelectQuantize: e => {
          dispatch(SET_QUANTIZE_DENOMINATOR, e.denominator)
          s.quantize = e.denominator
        }
      } as ArrangeToolbarProps)
  ),
  observer
)(ArrangeToolbar)
