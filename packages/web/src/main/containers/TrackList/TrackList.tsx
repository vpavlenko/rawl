import { compose } from "recompose"
import { inject, observer } from "mobx-react"
import RootStore from "stores/RootStore"
import {
  TOGGLE_MUTE_TRACK,
  TOGGLE_SOLO_TRACK,
  REMOVE_TRACK,
  ADD_TRACK,
  SELECT_TRACK
} from "actions"
import { TrackList, TrackListProps } from "components/TrackList/TrackList"

export default compose(
  inject(
    ({
      rootStore: {
        song,
        trackMute,
        rootViewStore,
        dispatch,
        router,
        services: { player }
      }
    }: {
      rootStore: RootStore
    }) =>
      ({
        trackMute,
        song,
        player: { player },
        isArrangeViewSelected: rootViewStore.isArrangeViewSelected,
        onClickMute: (trackId: number) => dispatch(TOGGLE_MUTE_TRACK, trackId),
        onClickSolo: (trackId: number) => dispatch(TOGGLE_SOLO_TRACK, trackId),
        onClickDelete: (trackId: number) => dispatch(REMOVE_TRACK, trackId),
        onClickAddTrack: () => dispatch(ADD_TRACK),
        // onChangeName: e => dispatch(SET_TRACK_NAME, { name: e.target.value }),
        onSelectTrack: (trackId: number) => {
          router.pushTrack()
          dispatch(SELECT_TRACK, trackId)
        },
        onClickArrangeView: () => {
          router.pushArrange()
        }
      } as TrackListProps)
  ),
  observer
)(TrackList)
