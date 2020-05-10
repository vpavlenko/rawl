import { compose } from "recompose"
import { inject, observer } from "mobx-react"
import RootStore from "stores/RootStore"
import {
  removeTrack,
  addTrack,
  selectTrack,
  toggleMuteTrack,
  toggleSoloTrack,
} from "actions"
import { TrackList, TrackListProps } from "components/TrackList/TrackList"

export default compose(
  inject(
    ({
      rootStore: {
        song,
        trackMute,
        rootViewStore,
        dispatch2,
        router,
        services: { player },
      },
    }: {
      rootStore: RootStore
    }) =>
      ({
        trackMute,
        song,
        player: { player },
        isArrangeViewSelected: rootViewStore.isArrangeViewSelected,
        onClickMute: (trackId: number) => dispatch2(toggleMuteTrack(trackId)),
        onClickSolo: (trackId: number) => dispatch2(toggleSoloTrack(trackId)),
        onClickDelete: (trackId: number) => dispatch2(removeTrack(trackId)),
        onClickAddTrack: () => dispatch2(addTrack()),
        // onChangeName: e => dispatch(SET_TRACK_NAME, { name: e.target.value }),
        onSelectTrack: (trackId: number) => {
          router.pushTrack()
          dispatch2(selectTrack(trackId))
          rootViewStore.openDrawer = false
        },
        onClickArrangeView: () => {
          router.pushArrange()
        },
      } as TrackListProps)
  ),
  observer
)(TrackList)
