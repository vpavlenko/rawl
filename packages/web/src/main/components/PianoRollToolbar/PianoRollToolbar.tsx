import React, { StatelessComponent } from "react"
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button
} from "@material-ui/core"
import { Menu as MenuIcon } from "@material-ui/icons"
import Track from "common/track/Track"

import { ToolbarItem, ToolbarSeparator } from "components/groups/Toolbar"

import Icon from "components/outputs/Icon"
import Knob from "components/inputs/Knob"
import Slider from "components/inputs/Slider"

import QuantizeSelector from "components/QuantizeSelector/QuantizeSelector"

import "./PianoRollToolbar.css"
import { PianoRollMouseMode } from "stores/PianoRollStore"

export interface PianoRollToolbarProps {
  track: Track
  autoScroll: boolean
  onClickAutoScroll: () => void
  mouseMode: PianoRollMouseMode
  onClickPencil: () => void
  onClickSelection: () => void
  quantize: number
  onSelectQuantize: (e: { denominator: number }) => void
  onChangeVolume: (value: number) => void
  onChangePan: (value: number) => void
  onClickInstrument: () => void
  onClickNavBack: () => void
}

export const PianoRollToolbar: StatelessComponent<PianoRollToolbarProps> = ({
  track,
  onChangeVolume,
  onChangePan,
  onClickInstrument,
  onClickNavBack,
  autoScroll,
  onClickAutoScroll,
  mouseMode,
  onClickPencil,
  onClickSelection,
  quantize,
  onSelectQuantize
}) => {
  return (
    <AppBar position="static">
      <Toolbar variant="dense">
        <IconButton onClick={onClickNavBack}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6">{track.displayName}</Typography>
        <Button onClick={onClickInstrument}>
          <Icon>piano</Icon>
          {track.instrumentName}
        </Button>
        <Slider
          onChange={value => onChangeVolume(value)}
          maxValue={127}
          value={track.volume}
        />
        <Knob
          value={track.pan}
          onChange={value => onChangePan(value)}
          minValue={0}
          maxValue={127}
          offsetDegree={-140}
          maxDegree={280}
        />
        <ToolbarItem onClick={onClickPencil} selected={mouseMode === "pencil"}>
          <Icon>pencil</Icon>
        </ToolbarItem>
        <ToolbarItem
          onClick={onClickSelection}
          selected={mouseMode === "selection"}
        >
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
    </AppBar>
  )
}
