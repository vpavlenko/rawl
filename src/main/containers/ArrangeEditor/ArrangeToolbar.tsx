import {
  ArrangeToolbar,
  ArrangeToolbarProps,
} from "components/ArrangeView/ArrangeToolbar"
import { compose } from "recompose"
import { inject, observer } from "mobx-react"
import RootStore from "stores/RootStore"
import { setQuantizeDenominator } from "src/main/actions"

export default compose(
  inject(
    ({
      rootStore: {
        services: { quantizer },
        arrangeViewStore: s,
        dispatch2,
      },
    }: {
      rootStore: RootStore
    }) =>
      ({
        quantize: s.quantize === 0 ? quantizer.denominator : s.quantize,
        autoScroll: s.autoScroll,
        onClickAutoScroll: () => (s.autoScroll = !s.autoScroll),
        onSelectQuantize: (e) => {
          dispatch2(setQuantizeDenominator(e.denominator))
          s.quantize = e.denominator
        },
      } as ArrangeToolbarProps)
  ),
  observer
)(ArrangeToolbar)
