import { List, ListItem, ListItemIcon, ListItemText } from "@material-ui/core"
import { Add } from "@material-ui/icons"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import styled from "styled-components"
import { localized } from "../../../../common/localize/localizedString"
import {
  addTrack,
  removeTrack,
  selectTrack,
  toggleMuteTrack,
  toggleSoloTrack,
} from "../../../actions"
import { useStores } from "../../../hooks/useStores"
import { ListHeader } from "../Drawer"
import TrackListItem, { TrackListItemData } from "./TrackListItem"

const AddTrackListIcon = styled(ListItemIcon)`
  min-width: auto;
  margin-right: 0.6em;
`

export const TrackList: FC = observer(() => {
  const rootStore = useStores()
  const { router } = rootStore

  const position = rootStore.services.player.position
  const selectedTrackId = rootStore.song.selectedTrackId
  const trackMutes = rootStore.song.tracks.map((_, i) =>
    rootStore.trackMute.isMuted(i)
  )
  const trackSolos = rootStore.song.tracks.map((_, i) =>
    rootStore.trackMute.isSolo(i)
  )
  const tracks = rootStore.song.tracks
    .filter((t) => !t.isConductorTrack)
    .map((t): TrackListItemData => {
      const index = rootStore.song.tracks.indexOf(t)
      const selected =
        !rootStore.rootViewStore.isArrangeViewSelected &&
        index === selectedTrackId
      return {
        index,
        name: t.displayName,
        instrument: t.instrumentName ?? "",
        mute: trackMutes[index],
        solo: trackSolos[index],
        selected,
        volume: t.getVolume(position) ?? 0,
        pan: t.getPan(position) ?? 0,
      }
    })

  const onClickMute = (trackId: number) => toggleMuteTrack(rootStore)(trackId)
  const onClickSolo = (trackId: number) => toggleSoloTrack(rootStore)(trackId)
  const onClickDelete = (trackId: number) => removeTrack(rootStore)(trackId)
  const onClickAddTrack = () => addTrack(rootStore)()
  // onChangeName={e => dispatch(SET_TRACK_NAME, { name: e.target.value })},
  const onSelectTrack = (trackId: number) => {
    router.pushTrack()
    selectTrack(rootStore)(trackId)
    rootStore.rootViewStore.openDrawer = false
  }
  const onClickArrangeView = () => {
    router.pushArrange()
  }

  const items = tracks.map((t) => (
    <TrackListItem
      key={t.index}
      {...t}
      onClick={() => onSelectTrack(t.index)}
      onClickSolo={() => onClickSolo(t.index)}
      onClickMute={() => onClickMute(t.index)}
      onClickDelete={() => onClickDelete(t.index)}
    />
  ))

  return (
    <List>
      <ListHeader onClick={onClickArrangeView}>
        {localized("tracks", "Tracks")}
      </ListHeader>
      {items}
      <ListItem button onClick={onClickAddTrack}>
        <AddTrackListIcon>
          <Add />
        </AddTrackListIcon>
        <ListItemText primary={localized("add-track", "Add track")} />
      </ListItem>
    </List>
  )
})
