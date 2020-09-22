import React, { FC, useCallback } from "react"
import { AppBar, Toolbar, IconButton, Button } from "@material-ui/core"
import { Menu as MenuIcon, KeyboardTab } from "@material-ui/icons"
import { ToggleButton, ToggleButtonGroup } from "@material-ui/lab"

import Icon from "components/outputs/Icon"

import QuantizeSelector from "components/QuantizeSelector/QuantizeSelector"

import { makeStyles } from "@material-ui/styles"
import InstrumentBrowser from "../InstrumentBrowser/InstrumentBrowser"
import { VolumeSlider } from "./VolumeSlider"
import { PanSlider } from "./PanSlider"
import { useObserver } from "mobx-react"
import { setTrackVolume, setTrackPan } from "main/actions"
import { useStores } from "main/hooks/useStores"
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

const TrackName = styled.span`
  font-weight: bold;
  margin-right: 2em;
  font-size: 1rem;
`

const AutoScrollIcon = styled(KeyboardTab)`
  font-size: 1.3rem;
`

export const PianoRollToolbar: FC = () => {
  const { rootStore: stores } = useStores()
  const {
    mouseMode,
    autoScroll,
    trackName,
    instrumentName,
    pan,
    volume,
    track,
    trackId,
    quantize,
  } = useObserver(() => ({
    trackName: stores.song.selectedTrack?.displayName ?? "",
    instrumentName: stores.song.selectedTrack?.instrumentName ?? "",
    pan: stores.song.selectedTrack?.pan ?? 0,
    volume: stores.song.selectedTrack?.volume ?? 0,
    track: stores.song.selectedTrack,
    trackId: stores.song.selectedTrackId,
    quantize:
      stores.pianoRollStore.quantize === 0
        ? stores.services.quantizer.denominator
        : stores.pianoRollStore.quantize,
    autoScroll: stores.pianoRollStore.autoScroll,
    mouseMode: stores.pianoRollStore.mouseMode,
  }))
  const { rootViewStore, pianoRollStore: s } = stores

  const onChangeVolume = useCallback(
    (value: number) => setTrackVolume(stores)(trackId, value),
    [stores, trackId]
  )
  const onChangePan = useCallback(
    (value: number) => setTrackPan(stores)(trackId, value),
    [stores, trackId]
  )
  const onClickPencil = useCallback(() => (s.mouseMode = "pencil"), [])
  const onClickSelection = useCallback(() => (s.mouseMode = "selection"), [])
  const onClickAutoScroll = useCallback(
    () => (s.autoScroll = !s.autoScroll),
    []
  )
  const onSelectQuantize = useCallback((denominator: number) => {
    stores.services.quantizer.denominator = denominator
    s.quantize = denominator
  }, [])
  const onClickNavBack = useCallback(
    () => (rootViewStore.openDrawer = true),
    []
  )
  const onClickInstrument = useCallback(() => {
    if (track === undefined) {
      return
    }
    const programNumber = track.programNumber
    s.instrumentBrowserSetting = {
      isRhythmTrack: track.isRhythmTrack,
      programNumber: programNumber ?? 0,
    }
    s.openInstrumentBrowser = true
  }, [])

  const classes = useStyles({})

  if (track === undefined) {
    return <></>
  }

  return (
    <AppBar position="static" elevation={0} className={classes.appBar}>
      <Toolbar variant="dense">
        <IconButton onClick={onClickNavBack} color="inherit">
          <MenuIcon />
        </IconButton>

        <TrackName>{trackName}</TrackName>

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
