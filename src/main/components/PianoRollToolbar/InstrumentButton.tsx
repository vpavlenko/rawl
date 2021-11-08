import { Button } from "@mui/material"
import { observer } from "mobx-react-lite"
import { FC, useCallback } from "react"
import styled from "styled-components"
import { useStores } from "../../hooks/useStores"
import PianoIcon from "../../images/piano.svg"

const StyledInstrumentButton = styled(Button)`
  padding: 0 1rem;
  border: 1px solid var(--divider-color);
  text-transform: none;
  height: 2rem;
  overflow: hidden;
`

const InstrumentIcon = styled(PianoIcon)`
  width: 1.3rem;
  fill: currentColor;
`

const Label = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 3em;
`

export const InstrumentButton: FC = observer(() => {
  const rootStore = useStores()

  const instrumentName = rootStore.song.selectedTrack?.instrumentName ?? ""

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
      <Label>{instrumentName}</Label>
    </StyledInstrumentButton>
  )
})
