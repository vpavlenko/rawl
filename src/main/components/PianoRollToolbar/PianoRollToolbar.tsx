import React, { FC } from "react"
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
} from "@material-ui/core"
import { Menu as MenuIcon, KeyboardTab } from "@material-ui/icons"
import { ToggleButton, ToggleButtonGroup } from "@material-ui/lab"

import Icon from "components/outputs/Icon"

import QuantizeSelector from "components/QuantizeSelector/QuantizeSelector"

import { PianoRollMouseMode } from "stores/PianoRollStore"
import { makeStyles } from "@material-ui/styles"
import InstrumentBrowser from "../InstrumentBrowser/InstrumentBrowser"
import { VolumeSlider } from "./VolumeSlider"
import { PanSlider } from "./PanSlider"
import styled from "styled-components"

const useStyles = makeStyles((theme) => ({
  appBar: {
    background: "var(--background-color)",
    borderBottom: "1px solid var(--divider-color)",
  },
  title: {
    marginRight: "1rem",
  },
  toggleButtonGroup: {
    backgroundColor: "transparent",
    marginRight: "1rem",
  },
  toggleButton: {
    height: "2rem",
    color: "var(--text-color)",
    fontSize: "1rem",
    ["&.Mui-selected"]: {
      background: "var(--theme-color)",
    },
  },
  instrumentButton: {
    padding: "0 1rem",
    border: "1px solid var(--divider-color)",
    textTransform: "none",
  },
}))

const AutoScrollIcon = styled(KeyboardTab)`
  font-size: 1.3rem;
`

export interface PianoRollToolbarProps {
  trackName: string
  instrumentName: string
  pan: number
  volume: number
  autoScroll: boolean
  mouseMode: PianoRollMouseMode
  quantize: number
  onClickAutoScroll: () => void
  onClickPencil: () => void
  onClickSelection: () => void
  onSelectQuantize: (denominator: number) => void
  onChangeVolume: (value: number) => void
  onChangePan: (value: number) => void
  onClickInstrument: () => void
  onClickNavBack: () => void
}

export const PianoRollToolbar: FC<PianoRollToolbarProps> = React.memo(
  ({
    trackName,
    instrumentName,
    pan,
    volume,
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
    onSelectQuantize,
  }) => {
    const classes = useStyles({})
    return (
      <AppBar position="static" elevation={0} className={classes.appBar}>
        <Toolbar variant="dense">
          <IconButton onClick={onClickNavBack} color="inherit">
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" className={classes.title}>
            {trackName}
          </Typography>

          <Button
            className={classes.instrumentButton}
            onClick={onClickInstrument}
            color="inherit"
            size="small"
            startIcon={<Icon>piano</Icon>}
          >
            {instrumentName}
          </Button>

          <InstrumentBrowser />

          <VolumeSlider onChange={onChangeVolume} value={volume} />
          <PanSlider value={pan} onChange={onChangePan} />
          <ToggleButtonGroup
            value={mouseMode}
            className={classes.toggleButtonGroup}
          >
            <ToggleButton
              color="inherit"
              onClick={onClickPencil}
              value="pencil"
              className={classes.toggleButton}
            >
              <Icon>pencil</Icon>
            </ToggleButton>
            <ToggleButton
              color="inherit"
              onClick={onClickSelection}
              value="selection"
              className={classes.toggleButton}
            >
              <Icon>select</Icon>
            </ToggleButton>
          </ToggleButtonGroup>

          <QuantizeSelector value={quantize} onSelect={onSelectQuantize} />

          <ToggleButton
            color="inherit"
            onClick={onClickAutoScroll}
            selected={autoScroll}
            className={classes.toggleButton}
          >
            <AutoScrollIcon />
          </ToggleButton>
        </Toolbar>
      </AppBar>
    )
  }
)
