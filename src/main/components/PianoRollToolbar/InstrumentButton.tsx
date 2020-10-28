import { Button } from "@material-ui/core"
import { useObserver } from "mobx-react-lite"
import React, { FC, useCallback } from "react"
import styled from "styled-components"
import { useStores } from "../../hooks/useStores"
import PianoIcon from "../../images/piano.svg"

const StyledInstrumentButton = styled(Button)`
  padding: 0 1rem;
  border: 1px solid var(--divider-color);
  text-transform: none;
  height: 2rem;
`

const InstrumentIcon = styled(PianoIcon)`
  width: 1.3rem;
  fill: currentColor;
`

export const InstrumentButton: FC = () => {
  const { rootStore } = useStores()

  const instrumentName = useObserver(
    () => rootStore.song.selectedTrack?.instrumentName ?? ""
  )

  const onClickInstrument = useCallback(() => {
    const track = rootStore.song.selectedTrack
    if (track === undefined) {
      return
    }
    const programNumber = track.programNumber
    rootStore.pianoRollStore.instrumentBrowserSetting = {
      isRhythmTrack: track.isRhythmTrack,
      programNumber: programNumber ?? 0,
    }
    rootStore.pianoRollStore.openInstrumentBrowser = true
  }, [rootStore])

  return (
    <StyledInstrumentButton
      onClick={onClickInstrument}
      startIcon={<InstrumentIcon viewBox="0 0 24 24" />}
    >
      {instrumentName}
    </StyledInstrumentButton>
  )
}
