import React, { SFC } from "react"
import { useObserver } from "mobx-react"
import {
  removeTrack,
  addTrack,
  selectTrack,
  toggleMuteTrack,
  toggleSoloTrack,
} from "actions"
import { TrackList } from "components/TrackList/TrackList"
import { useStores } from "main/hooks/useStores"
import { TrackListItemData } from "src/main/components/TrackList/TrackListItem"

const TrackListWrapper: SFC<{}> = () => {
  const { rootStore: stores } = useStores()
  const { dispatch, router } = stores
  const { tracks } = useObserver(() => {
    const selectedTrackId = stores.song.selectedTrackId
    const trackMutes = stores.song.tracks.map((_, i) =>
      stores.trackMute.isMuted(i)
    )
    const trackSolos = stores.song.tracks.map((_, i) =>
      stores.trackMute.isSolo(i)
    )
    const tracks = stores.song.tracks
      .filter((t) => !t.isConductorTrack)
      .map(
        (t): TrackListItemData => {
          const index = stores.song.tracks.indexOf(t)
          const selected =
            !stores.rootViewStore.isArrangeViewSelected &&
            index === selectedTrackId
          return {
            index,
            name: t.displayName,
            instrument: t.instrumentName ?? "",
            mute: trackMutes[index],
            solo: trackSolos[index],
            selected,
            volume: t.volume ?? 0,
            pan: t.pan ?? 0,
          }
        }
      )
    return {
      tracks,
    }
  })

  return (
    <TrackList
      tracks={tracks}
      onClickMute={(trackId) => dispatch(toggleMuteTrack(trackId))}
      onClickSolo={(trackId) => dispatch(toggleSoloTrack(trackId))}
      onClickDelete={(trackId) => dispatch(removeTrack(trackId))}
      onClickAddTrack={() => dispatch(addTrack())}
      // onChangeName={e => dispatch(SET_TRACK_NAME, { name: e.target.value })},
      onSelectTrack={(trackId) => {
        router.pushTrack()
        dispatch(selectTrack(trackId))
        stores.rootViewStore.openDrawer = false
      }}
      onClickArrangeView={() => {
        router.pushArrange()
      }}
    />
  )
}

export default TrackListWrapper
