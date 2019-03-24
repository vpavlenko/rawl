import React, { StatelessComponent } from "react"

import SideHeader from "components/Sidebar/Header"
import TrackMute from "common/trackMute/TrackMute"
import Song from "common/song/Song"

import TrackListItem from "./TrackListItem"
import { AddTrackButton } from "./AddTrackButton"

import "./TrackList.css"

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
          name={t.displayName || `Track ${t.channel}`}
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
    <div className="TrackList">
      <SideHeader title="Tracks" onClickTitle={onClickArrangeView}>
        <AddTrackButton onClick={onClickAddTrack} />
      </SideHeader>
      {items}
    </div>
  )
}
