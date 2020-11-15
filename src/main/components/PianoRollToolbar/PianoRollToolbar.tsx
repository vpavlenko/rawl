import { AppBar, IconButton, Toolbar } from "@material-ui/core"
import { KeyboardTab, Menu as MenuIcon } from "@material-ui/icons"
import { makeStyles } from "@material-ui/styles"
import { useObserver } from "mobx-react-lite"
import React, { FC, useCallback } from "react"
import styled from "styled-components"
import { localized } from "../../../common/localize/localizedString"
import { useStores } from "../../hooks/useStores"
import InstrumentBrowser from "../InstrumentBrowser/InstrumentBrowser"
import { GhostTrackSelector } from "./GhostTrackSelector"
import { InstrumentButton } from "./InstrumentButton"
import { PanSlider } from "./PanSlider"
import QuantizeSelector from "./QuantizeSelector/QuantizeSelector"
import { StyledToggleButton, ToolSelector } from "./ToolSelector"
import { TrackNameInput } from "./TrackNameInput"
import { VolumeSlider } from "./VolumeSlider"

const useStyles = makeStyles((theme) => ({
  appBar: {
    background: "var(--background-color)",
    borderBottom: "1px solid var(--divider-color)",
  },
  title: {
    marginRight: "1rem",
  },
}))

const AutoScrollIcon = styled(KeyboardTab)`
  height: 2rem;
  font-size: 1.3rem;
`

const NavBackButton = styled(IconButton)`
  &:hover {
    background: none;
    color: var(--secondary-text-color);
  }
`

export const PianoRollToolbar: FC = () => {
  const rootStore = useStores()

  const { trackName, autoScroll, track, trackId, quantize } = useObserver(
    () => ({
      trackName: rootStore.song.selectedTrack?.displayName ?? "",
      track: rootStore.song.selectedTrack,
      trackId: rootStore.song.selectedTrackId,
      quantize:
        rootStore.pianoRollStore.quantize === 0
          ? rootStore.services.quantizer.denominator
          : rootStore.pianoRollStore.quantize,
      autoScroll: rootStore.pianoRollStore.autoScroll,
    })
  )
  const { rootViewStore, pianoRollStore: s } = rootStore

  const onClickAutoScroll = useCallback(() => (s.autoScroll = !s.autoScroll), [
    s,
  ])
  const onSelectQuantize = useCallback(
    (denominator: number) => {
      rootStore.services.quantizer.denominator = denominator
      s.quantize = denominator
    },
    [rootStore, s]
  )
  const onClickNavBack = useCallback(() => (rootViewStore.openDrawer = true), [
    rootViewStore,
  ])

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

        <TrackNameInput />

        <InstrumentButton />
        <InstrumentBrowser />

        <VolumeSlider trackId={trackId} />
        <PanSlider trackId={trackId} />

        <ToolSelector />

        <QuantizeSelector value={quantize} onSelect={onSelectQuantize} />

        <StyledToggleButton
          onClick={onClickAutoScroll}
          selected={autoScroll}
          value="autoScroll"
          title={localized("auto-scroll", "Auto-Scroll")}
        >
          <AutoScrollIcon />
        </StyledToggleButton>

        <GhostTrackSelector />
      </Toolbar>
    </AppBar>
  )
}
