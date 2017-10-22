import React from "react"
import { observer, inject } from "mobx-react"

import Icon from "components/Icon"
import { Toolbar, ToolbarItem, ToolbarSeparator } from "components/groups/Toolbar"

import QuantizeSelector from "./QuantizeSelector"
import { TIME_BASE } from "Constants"

import "./MainToolbar.css"

function MainToolbar({
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

  return <Toolbar>
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
  pianoRollStore,
  dispatch
} }) => ({
    quantize: pianoRollStore.quantize === 0 ? quantizer.denominator : pianoRollStore.quantize,
    mouseMode: pianoRollStore.mouseMode,
    autoScroll: pianoRollStore.autoScroll,
    onClickPlay: () => dispatch("PLAY"),
    onClickStop: () => dispatch("STOP"),
    onClickBackward: () => dispatch("MOVE_PLAYER_POSITION", { tick: -TIME_BASE * 4 }),
    onClickForward: () => dispatch("MOVE_PLAYER_POSITION", { tick: TIME_BASE * 4 }),
    onClickPencil: () => pianoRollStore.mouseMode = 0,
    onClickSelection: () => pianoRollStore.mouseMode = 1,
    onClickScaleUp: () => pianoRollStore.scaleX = pianoRollStore.scaleX + 0.1,
    onClickScaleDown: () => pianoRollStore.scaleX = Math.max(0.05, pianoRollStore.scaleX - 0.1),
    onClickAutoScroll: () => pianoRollStore.autoScroll = !pianoRollStore.autoScroll,
    onSelectQuantize: e => {
      dispatch("SET_QUANTIZE_DENOMINATOR", { denominator: e.denominator })
      pianoRollStore.quantize = e.denominator
    }
  }))(observer(MainToolbar))