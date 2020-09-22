import React, { FC } from "react"

import { List, ListItem, ListItemIcon, ListItemText } from "@material-ui/core"

import TrackListItem, { TrackListItemData } from "./TrackListItem"
import { Add } from "@material-ui/icons"
import { ListHeader } from "main/containers/PianoRollEditor/PianoRollDrawer"

export interface TrackListProps {
  tracks: TrackListItemData[]
  onSelectTrack: (trackId: number) => void
  onClickSolo: (trackId: number) => void
  onClickMute: (trackId: number) => void
  onClickDelete: (trackId: number) => void
  onClickAddTrack: () => void
  onClickArrangeView: () => void
}

export const TrackList: FC<TrackListProps> = ({
  tracks,
  onSelectTrack,
  onClickSolo,
  onClickMute,
  onClickDelete,
  onClickAddTrack,
  onClickArrangeView,
}) => {
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
      <ListHeader onClick={onClickArrangeView}>Tracks</ListHeader>
      {items}
      <ListItem button onClick={onClickAddTrack}>
        <ListItemIcon>
          <Add />
        </ListItemIcon>
        <ListItemText primary="New track" />
      </ListItem>
    </List>
  )
}
