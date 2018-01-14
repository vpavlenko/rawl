import React from "react"
import { observer, inject } from "mobx-react"

import Icon from "components/Icon"
import { Toolbar, ToolbarItem, ToolbarSeparator } from "components/groups/Toolbar"

import QuantizeSelector from "components/QuantizeSelector"

import "./PianoRollToolbar.css"

function PianoRollToolbar({
  onClickPlay,
  onClickStop,
  onClickBackward,
  onClickForward,
  autoScroll,
  onClickAutoScroll,
  mouseMode,
  onClickPencil,
  onClickSelection,
  quantize,
  onSelectQuantize,
  onClickScaleUp,
  onClickScaleDown,
  mbtTime }) {

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
    <ToolbarItem onClick={onClickScaleUp}><Icon>magnify-plus</Icon></ToolbarItem>
    <ToolbarItem onClick={onClickScaleDown}><Icon>magnify-minus</Icon></ToolbarItem>
  </Toolbar>
}

export default inject(({ rootStore: {
  services: { quantizer },
  pianoRollStore: s,
  playerStore: { loop },
  dispatch
} }) => ({
    quantize: s.quantize === 0 ? quantizer.denominator : s.quantize,
    mouseMode: s.mouseMode,
    autoScroll: s.autoScroll,
    onClickPencil: () => s.mouseMode = 0,
    onClickSelection: () => s.mouseMode = 1,
    onClickScaleUp: () => s.scaleX = s.scaleX + 0.1,
    onClickScaleDown: () => s.scaleX = Math.max(0.05, s.scaleX - 0.1),
    onClickAutoScroll: () => s.autoScroll = !s.autoScroll,
    onSelectQuantize: e => {
      dispatch("SET_QUANTIZE_DENOMINATOR", { denominator: e.denominator })
      s.quantize = e.denominator
    }
  }))(observer(PianoRollToolbar))