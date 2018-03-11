import React from "react"
import { observer, inject } from "mobx-react"

import Icon from "components/Icon"
import { Toolbar, ToolbarItem, ToolbarSeparator } from "components/groups/Toolbar"

import QuantizeSelector from "components/QuantizeSelector"

import "./ArrangeToolbar.css"

function ArrangeToolbar({
  autoScroll,
  onClickAutoScroll,
  quantize,
  onSelectQuantize,
}) {
  return <Toolbar className="ArrangeToolbar">
    <QuantizeSelector
      value={quantize}
      onSelect={value => onSelectQuantize({ denominator: value })}
    />

    <ToolbarSeparator />

    <ToolbarItem onClick={onClickAutoScroll} selected={autoScroll}><Icon>pin</Icon></ToolbarItem>
  </Toolbar>
}

export default inject(({ rootStore: {
  services: { quantizer },
  arrangeViewStore: s,
  dispatch
} }) => ({
  quantize: s.quantize === 0 ? quantizer.denominator : s.quantize,
  autoScroll: s.autoScroll,
  onClickAutoScroll: () => s.autoScroll = !s.autoScroll,
  onSelectQuantize: e => {
    dispatch("SET_QUANTIZE_DENOMINATOR", { denominator: e.denominator })
    s.quantize = e.denominator
  }
}))(observer(ArrangeToolbar))