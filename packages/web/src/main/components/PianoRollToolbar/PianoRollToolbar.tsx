import React, { StatelessComponent } from "react"

import Icon from "components/outputs/Icon"
import {
  Toolbar,
  ToolbarItem,
  ToolbarSeparator
} from "components/groups/Toolbar"

import QuantizeSelector from "components/QuantizeSelector/QuantizeSelector"

import "./PianoRollToolbar.css"

export interface PianoRollToolbarProps {
  autoScroll: boolean
  onClickAutoScroll: (e: any) => void
  mouseMode: number
  onClickPencil: (e: any) => void
  onClickSelection: (e: any) => void
  quantize: number
  onSelectQuantize: (e: { denominator: number }) => void
}

export const PianoRollToolbar: StatelessComponent<PianoRollToolbarProps> = ({
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
