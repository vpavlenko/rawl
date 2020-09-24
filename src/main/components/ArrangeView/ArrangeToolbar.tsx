import React, { FC } from "react"

import {
  Toolbar,
  ToolbarItem,
  ToolbarSeparator,
} from "components/groups/Toolbar"
import QuantizeSelector from "../PianoRollToolbar/QuantizeSelector/QuantizeSelector"

import "./ArrangeToolbar.css"
import { KeyboardTab } from "@material-ui/icons"

export interface ArrangeToolbarProps {
  autoScroll: boolean
  onClickAutoScroll: () => void
  quantize: number
  onSelectQuantize: (e: { denominator: number }) => void
}

export const ArrangeToolbar: FC<ArrangeToolbarProps> = ({
  autoScroll,
  onClickAutoScroll,
  quantize,
  onSelectQuantize,
}) => {
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
