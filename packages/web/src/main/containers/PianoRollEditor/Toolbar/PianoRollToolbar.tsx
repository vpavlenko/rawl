import React, { StatelessComponent } from "react"
import { observer, inject } from "mobx-react"

import Icon from "components/Icon"
import {
  Toolbar,
  ToolbarItem,
  ToolbarSeparator
} from "components/groups/Toolbar"

import QuantizeSelector from "components/QuantizeSelector"

import "./PianoRollToolbar.css"
import { compose } from "recompose"
import { SET_QUANTIZE_DENOMINATOR } from "main/actions"
import RootStore from "src/main/stores/RootStore"

export interface PianoRollToolbarProps {
  autoScroll: boolean
  onClickAutoScroll: (e: any) => void
  mouseMode: number
  onClickPencil: (e: any) => void
  onClickSelection: (e: any) => void
  quantize: number
  onSelectQuantize: (e: { denominator: number }) => void
}

const PianoRollToolbar: StatelessComponent<PianoRollToolbarProps> = ({
  autoScroll,
  onClickAutoScroll,
  mouseMode,
  onClickPencil,
  onClickSelection,
  quantize,
  onSelectQuantize
}) => {
  return (
    <Toolbar className="PianoRollToolbar">
      <ToolbarItem onClick={onClickPencil} selected={mouseMode === 0}>
        <Icon>pencil</Icon>
      </ToolbarItem>
      <ToolbarItem onClick={onClickSelection} selected={mouseMode === 1}>
        <Icon>select</Icon>
      </ToolbarItem>

      <ToolbarSeparator />

      <QuantizeSelector
        value={quantize}
        onSelect={value => onSelectQuantize({ denominator: value })}
      />

      <ToolbarSeparator />

      <ToolbarItem onClick={onClickAutoScroll} selected={autoScroll}>
        <Icon>pin</Icon>
      </ToolbarItem>
    </Toolbar>
  )
}

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
        onClickPencil: () => (s.mouseMode = 0),
        onClickSelection: () => (s.mouseMode = 1),
        onClickAutoScroll: () => (s.autoScroll = !s.autoScroll),
        onSelectQuantize: e => {
          dispatch(SET_QUANTIZE_DENOMINATOR, e.denominator)
          s.quantize = e.denominator
        }
      } as PianoRollToolbarProps)
  ),
  observer
)(PianoRollToolbar)
