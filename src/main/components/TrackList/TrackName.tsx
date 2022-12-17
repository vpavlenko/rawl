import { observer } from "mobx-react-lite"
import { FC } from "react"
import Track from "../../../common/track/Track"
import { Localized } from "../../../components/Localized"

// Display the track number if there is no name track name for display
export const TrackName: FC<{ track: Track }> = observer(({ track }) => {
  if (track.name && track.name.length > 0) {
    return <>{track.name}</>
  }
  if (track.channel === undefined) {
    return (
      <>
        <Localized default="Conductor Track">conductor-track</Localized>
      </>
    )
  }
  return (
    <>
      <Localized default="Track">track</Localized> {track.channel + 1}
    </>
  )
})
