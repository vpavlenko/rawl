import React, { StatelessComponent } from "react"

import TrackMute from "common/trackMute/TrackMute"
import Song from "common/song/Song"
import {
  Button,
  List,
  ListSubheader,
  ListItem,
  ListItemIcon,
  ListItemText
} from "@material-ui/core"

import TrackListItem from "./TrackListItem"

import "./TrackList.css"
import { Add } from "@material-ui/icons"

export interface TrackListProps {
  song: Song
  trackMute: TrackMute
  isArrangeViewSelected: boolean
  onSelectTrack: (trackId: number) => void
  onClickSolo: (trackId: number) => void
  onClickMute: (trackId: number) => void
  onClickDelete: (trackId: number) => void
  onClickAddTrack: () => void
  onClickArrangeView: () => void
}

export const TrackList: StatelessComponent<TrackListProps> = ({
  song,
  trackMute,
  isArrangeViewSelected = false,
  onSelectTrack,
  onClickSolo,
  onClickMute,
  onClickDelete,
  onClickAddTrack,
  onClickArrangeView
}) => {
  const { tracks, selectedTrackId } = song
  const trackMutes = tracks.map((_, i) => trackMute.isMuted(i))
  const trackSolos = tracks.map((_, i) => trackMute.isSolo(i))

  const items = tracks
    .filter(t => !t.isConductorTrack)
    .map(t => {
      const i = tracks.indexOf(t)
      const selected = !isArrangeViewSelected && i === selectedTrackId

      return (
        <TrackListItem
          key={i}
          name={t.displayName}
          instrument={t.instrumentName}
          mute={trackMutes[i]}
          solo={trackSolos[i]}
          selected={selected}
          volume={t.volume}
          pan={t.pan}
          onClick={() => onSelectTrack(i)}
          onClickSolo={() => onClickSolo(i)}
          onClickMute={() => onClickMute(i)}
          onClickDelete={() => onClickDelete(i)}
        />
      )
    })

  return (
    <List>
      <ListSubheader onClick={onClickArrangeView}>Tracks</ListSubheader>
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
