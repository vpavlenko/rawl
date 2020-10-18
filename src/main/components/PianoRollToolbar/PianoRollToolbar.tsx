import { AppBar, Button, IconButton, Toolbar } from "@material-ui/core"
import { Create, KeyboardTab, Menu as MenuIcon } from "@material-ui/icons"
import { ToggleButton, ToggleButtonGroup } from "@material-ui/lab"
import { makeStyles } from "@material-ui/styles"
import { setTrackPan, setTrackVolume } from "main/actions"
import QuantizeSelector from "main/components/PianoRollToolbar/QuantizeSelector/QuantizeSelector"
import { useStores } from "main/hooks/useStores"
import { useObserver } from "mobx-react-lite"
import React, { FC, useCallback } from "react"
import styled from "styled-components"
import { localized } from "../../../common/localize/localizedString"
import PianoIcon from "../../images/piano.svg"
import SelectIcon from "../../images/select.svg"
import InstrumentBrowser from "../InstrumentBrowser/InstrumentBrowser"
import { GhostTrackSelector } from "./GhostTrackSelector"
import { PanSlider } from "./PanSlider"
import { VolumeSlider } from "./VolumeSlider"

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
    padding: "0 0.7rem",
    ["&.Mui-selected"]: {
      background: "var(--theme-color)",
    },
  },
  instrumentButton: {
    padding: "0 1rem",
    border: "1px solid var(--divider-color)",
    textTransform: "none",
    height: "2rem",
  },
}))

const TrackName = styled.span`
  font-weight: bold;
  margin-right: 2em;
  font-size: 1rem;
`

const AutoScrollIcon = styled(KeyboardTab)`
  height: 2rem;
  font-size: 1.3rem;
`

const InstrumentIcon = styled(PianoIcon)`
  width: 1.3rem;
  fill: currentColor;
`

const SelectionToolIcon = styled(SelectIcon)`
  width: 1rem;
  fill: currentColor;
`

const NavBackButton = styled(IconButton)`
  &:hover {
    background: none;
    color: var(--secondary-text-color);
  }
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
    pan:
      stores.song.selectedTrack?.getPan(stores.services.player.position) ?? 0,
    volume:
      stores.song.selectedTrack?.getVolume(stores.services.player.position) ??
      0,
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
  const onClickPencil = useCallback(() => (s.mouseMode = "pencil"), [s])
  const onClickSelection = useCallback(() => (s.mouseMode = "selection"), [s])
  const onClickAutoScroll = useCallback(() => (s.autoScroll = !s.autoScroll), [
    s,
  ])
  const onSelectQuantize = useCallback(
    (denominator: number) => {
      stores.services.quantizer.denominator = denominator
      s.quantize = denominator
    },
    [stores, s]
  )
  const onClickNavBack = useCallback(() => (rootViewStore.openDrawer = true), [
    rootViewStore,
  ])
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
  }, [track, s])

  const classes = useStyles({})

  if (track === undefined) {
    return <></>
  }

  return (
    <AppBar position="static" elevation={0} className={classes.appBar}>
      <Toolbar variant="dense">
        <NavBackButton onClick={onClickNavBack}>
          <MenuIcon />
        </NavBackButton>

        <TrackName>{trackName}</TrackName>

        <Button
          className={classes.instrumentButton}
          onClick={onClickInstrument}
          startIcon={<InstrumentIcon viewBox="0 0 24 24" />}
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
            onClick={onClickPencil}
            value="pencil"
            className={classes.toggleButton}
          >
            <Create
              style={{
                width: "1rem",
              }}
            />
          </ToggleButton>
          <ToggleButton
            onClick={onClickSelection}
            value="selection"
            className={classes.toggleButton}
          >
            <SelectionToolIcon viewBox="0 0 24 24" />
          </ToggleButton>
        </ToggleButtonGroup>

        <QuantizeSelector value={quantize} onSelect={onSelectQuantize} />

        <ToggleButton
          onClick={onClickAutoScroll}
          selected={autoScroll}
          value="autoScroll"
          className={classes.toggleButton}
          title={localized("auto-scroll", "Auto-Scroll")}
        >
          <AutoScrollIcon />
        </ToggleButton>

        <GhostTrackSelector />
      </Toolbar>
    </AppBar>
  )
}
