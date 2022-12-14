import { observer } from "mobx-react-lite"
import { FC } from "react"
import { getInstrumentName } from "../../../common/midi/GM"
import Track from "../../../common/track/Track"

export const InstrumentName: FC<{ programNumber: number | undefined }> = ({
  programNumber,
}) => {
  if (programNumber !== undefined) {
    return <>{getInstrumentName(programNumber) ?? ""}</>
  }
  return <></>
}

export const TrackInstrumentName: FC<{ track: Track }> = observer(
  ({ track }) => {
    if (track.isRhythmTrack) {
      return <>Standard Drum Kit</>
    }
    return <InstrumentName programNumber={track.programNumber} />
  }
)
