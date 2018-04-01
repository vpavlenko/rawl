import React from "react"
import { observer, inject } from "mobx-react"

import Icon from "components/Icon.tsx"
import { Toolbar, ToolbarItem, ToolbarSeparator } from "components/groups/Toolbar.tsx"

import QuantizeSelector from "components/QuantizeSelector"

import "./PianoRollToolbar.css"

function PianoRollToolbar({
  autoScroll,
  onClickAutoScroll,
  mouseMode,
  onClickPencil,
  onClickSelection,
  quantize,
  onSelectQuantize,
}) {

  return <Toolbar className="PianoRollToolbar">
    <ToolbarItem onClick={onClickPencil} selected={mouseMode === 0}><Icon>pencil</Icon></ToolbarItem>
    <ToolbarItem onClick={onClickSelection} selected={mouseMode === 1}><Icon>select</Icon></ToolbarItem>

    <ToolbarSeparator />

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
  pianoRollStore: s,
  dispatch
} }) => ({
  quantize: s.quantize === 0 ? quantizer.denominator : s.quantize,
  mouseMode: s.mouseMode,
  autoScroll: s.autoScroll,
  onClickPencil: () => s.mouseMode = 0,
  onClickSelection: () => s.mouseMode = 1,
  onClickAutoScroll: () => s.autoScroll = !s.autoScroll,
  onSelectQuantize: e => {
    dispatch("SET_QUANTIZE_DENOMINATOR", { denominator: e.denominator })
    s.quantize = e.denominator
  }
}))(observer(PianoRollToolbar))