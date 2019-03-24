import React, { StatelessComponent } from "react"
import { observer, inject } from "mobx-react"
import { compose } from "recompose"

import SideHeader from "components/Sidebar/Header"
import TrackMute from "common/trackMute/TrackMute"
import Song from "common/song/Song"

import TrackListItem from "./TrackListItem"
import { AddTrackButton } from "./AddTrackButton"

import "./TrackList.css"
import {
  TOGGLE_MUTE_TRACK,
  TOGGLE_SOLO_TRACK,
  REMOVE_TRACK,
  ADD_TRACK,
  SET_TRACK_NAME,
  SELECT_TRACK
} from "main/actions"
import RootStore from "stores/RootStore"

interface TrackListProps {
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

const TrackList: StatelessComponent<TrackListProps> = ({
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
