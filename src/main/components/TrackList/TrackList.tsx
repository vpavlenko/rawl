import { List, ListItem, ListItemIcon, ListItemText } from "@material-ui/core"
import { Add } from "@material-ui/icons"
import { observer } from "mobx-react-lite"
import React, { FC } from "react"
import styled from "styled-components"
import { localized } from "../../../common/localize/localizedString"
import { addTrack } from "../../actions"
import { useStores } from "../../hooks/useStores"
import { TrackListItem } from "./TrackListItem"

const AddTrackListIcon = styled(ListItemIcon)`
  min-width: auto;
  margin-right: 0.6em;
`

export const TrackList: FC = observer(() => {
  const rootStore = useStores()

  const onClickAddTrack = () => addTrack(rootStore)()

  return (
    <List style={{ overflowY: "auto" }} disablePadding>
      {rootStore.song.tracks.map(
        (t, i) => !t.isConductorTrack && <TrackListItem key={i} trackId={i} />
      )}
      <ListItem button onClick={onClickAddTrack}>
        <AddTrackListIcon>
          <Add />
        </AddTrackListIcon>
        <ListItemText primary={localized("add-track", "Add track")} />
      </ListItem>
    </List>
  )
})
