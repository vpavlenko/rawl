import { AppBar, Toolbar } from "@material-ui/core"
import { KeyboardTab } from "@material-ui/icons"
import { makeStyles } from "@material-ui/styles"
import { observer } from "mobx-react-lite"
import React, { FC, useCallback } from "react"
import styled from "styled-components"
import { localized } from "../../../common/localize/localizedString"
import { useStores } from "../../hooks/useStores"
import InstrumentBrowser from "../InstrumentBrowser/InstrumentBrowser"
import { TrackListMenuButton } from "../TrackList/TrackListMenuButton"
import { EventListButton } from "./EventListButton"
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

const Spacer = styled.div`
  width: 1rem;
`

const FlexibleSpacer = styled.div`
  flex-grow: 1;
`

export const PianoRollToolbar: FC = observer(() => {
  const { song, pianoRollStore } = useStores()

  const { selectedTrack, selectedTrackId } = song
  const { quantize: quantize, autoScroll } = pianoRollStore

  const onClickAutoScroll = useCallback(
    () => (pianoRollStore.autoScroll = !pianoRollStore.autoScroll),
    [pianoRollStore]
  )

  const onSelectQuantize = useCallback(
    (denominator: number) => {
      pianoRollStore.quantize = denominator
    },
    [pianoRollStore]
  )
  const classes = useStyles({})

  if (selectedTrack === undefined) {
    return <></>
  }

  return (
    <AppBar position="static" elevation={0} className={classes.appBar}>
      <Toolbar variant="dense">
        <TrackListMenuButton />

        <TrackNameInput />

        <EventListButton />

        <Spacer />

        <InstrumentButton />
        <InstrumentBrowser />

        <VolumeSlider trackId={selectedTrackId} />
        <PanSlider trackId={selectedTrackId} />

        <FlexibleSpacer />

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
})
