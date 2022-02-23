import styled from "@emotion/styled"
import { observer } from "mobx-react-lite"
import { FC, useCallback } from "react"
import { useStores } from "../../hooks/useStores"
import PianoIcon from "../../images/piano.svg"
import { ToolbarButton } from "../Toolbar/ToolbarButton"

const InstrumentIcon = styled(PianoIcon)`
  margin-right: 0.5rem;
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
    <ToolbarButton onClick={onClickInstrument}>
      <InstrumentIcon viewBox="0 0 24 24" />
      {instrumentName}
    </ToolbarButton>
  )
})
