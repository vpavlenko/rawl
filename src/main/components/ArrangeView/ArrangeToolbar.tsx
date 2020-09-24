import React, { FC, useCallback } from "react"

import {
  Toolbar,
  ToolbarItem,
  ToolbarSeparator,
} from "components/groups/Toolbar"
import QuantizeSelector from "../PianoRollToolbar/QuantizeSelector/QuantizeSelector"

import "./ArrangeToolbar.css"
import { KeyboardTab } from "@material-ui/icons"
import { useStores } from "../../hooks/useStores"
import { useObserver } from "mobx-react-lite"

export const ArrangeToolbar: FC = () => {
  const { rootStore } = useStores()
  const { quantize, autoScroll } = useObserver(() => ({
    quantize:
      rootStore.arrangeViewStore.quantize === 0
        ? rootStore.services.quantizer.denominator
        : rootStore.arrangeViewStore.quantize,
    autoScroll: rootStore.arrangeViewStore.autoScroll,
  }))

  const onClickAutoScroll = useCallback(
    () =>
      (rootStore.arrangeViewStore.autoScroll = !rootStore.arrangeViewStore
        .autoScroll),
    []
  )

  const onSelectQuantize = useCallback((e) => {
    rootStore.services.quantizer.denominator = e.denominator
    rootStore.arrangeViewStore.quantize = e.denominator
  }, [])

  return (
    <Toolbar className="ArrangeToolbar">
      <QuantizeSelector
        value={quantize}
        onSelect={(value) => onSelectQuantize({ denominator: value })}
      />

      <ToolbarSeparator />

      <ToolbarItem onClick={onClickAutoScroll} selected={autoScroll}>
        <KeyboardTab />
      </ToolbarItem>
    </Toolbar>
  )
}
