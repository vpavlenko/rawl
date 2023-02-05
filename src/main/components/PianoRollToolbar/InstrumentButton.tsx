import { observer } from "mobx-react-lite"
import { FC, useCallback } from "react"
import { categoryEmojis, getCategoryIndex } from "../../../common/midi/GM"
import { useStores } from "../../hooks/useStores"
import { ToolbarButton } from "../Toolbar/ToolbarButton"
import { TrackInstrumentName } from "../TrackList/InstrumentName"

export const InstrumentButton: FC = observer(() => {
  const {
    pianoRollStore,
    pianoRollStore: { selectedTrack },
  } = useStores()

  if (selectedTrack === undefined) {
    return <></>
  }

  const { programNumber } = selectedTrack
  const emoji = categoryEmojis[getCategoryIndex(programNumber ?? 0)]

  const onClickInstrument = useCallback(() => {
    const track = selectedTrack
    if (track === undefined) {
      return
    }
    const programNumber = track.programNumber
    pianoRollStore.instrumentBrowserSetting = {
      isRhythmTrack: track.isRhythmTrack,
      programNumber: programNumber ?? 0,
    }
    pianoRollStore.openInstrumentBrowser = true
  }, [pianoRollStore])

  return (
    <ToolbarButton onClick={onClickInstrument}>
      <span style={{ marginRight: "0.5rem" }}>{emoji}</span>
      <span>
        <TrackInstrumentName track={selectedTrack} />
      </span>
    </ToolbarButton>
  )
})
