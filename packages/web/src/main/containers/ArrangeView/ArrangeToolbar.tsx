import React, { StatelessComponent } from "react"
import { observer, inject } from "mobx-react"

import Icon from "components/Icon"
import { Toolbar, ToolbarItem, ToolbarSeparator } from "components/groups/Toolbar"

import QuantizeSelector from "components/QuantizeSelector"

import "./ArrangeToolbar.css"
import { compose } from "recompose";
import { SET_QUANTIZE_DENOMINATOR } from "main/actions";

export interface ArrangeToolbarProps {
  autoScroll: boolean
  onClickAutoScroll: (e: any) => void
  quantize: number
  onSelectQuantize: (e: { denominator: number }) => void
}

const ArrangeToolbar: StatelessComponent<ArrangeToolbarProps> = ({
  autoScroll,
  onClickAutoScroll,
  quantize,
  onSelectQuantize,
}) => {
  return <Toolbar className="ArrangeToolbar">
    <QuantizeSelector
      value={quantize}
      onSelect={value => onSelectQuantize({ denominator: value })}
    />

    <ToolbarSeparator />

    <ToolbarItem onClick={onClickAutoScroll} selected={autoScroll}><Icon>pin</Icon></ToolbarItem>
  </Toolbar>
}

export default compose(
  inject(({ rootStore: {
    services: { quantizer },
    arrangeViewStore: s,
    dispatch
  } }) => ({
    quantize: s.quantize === 0 ? quantizer.denominator : s.quantize,
    autoScroll: s.autoScroll,
    onClickAutoScroll: () => s.autoScroll = !s.autoScroll,
    onSelectQuantize: e => {
      dispatch(SET_QUANTIZE_DENOMINATOR, { denominator: e.denominator })
      s.quantize = e.denominator
    }
  })),
  observer,
)(ArrangeToolbar)
