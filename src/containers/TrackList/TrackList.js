import React from "react"
import { observer, inject } from "mobx-react"

import Icon from "components/Icon"
import SideHeader from "components/Sidebar/Header"
import TrackListItem from "./TrackListItem.tsx"
import AddTrackButton from "./AddTrackButton"

import "./TrackList.css"

function TrackList({
  song,
  trackMute,
  isArrangeViewSelected = false,
  onSelectTrack,
  onClickSolo,
  onClickMute,
  onClickAddTrack,
  onClickDelete,
  onClickArrangeView
}) {
  const { tracks, selectedTrackId } = song
  const trackMutes = tracks.map((_, i) => trackMute.isMuted(i))
  const trackSolos = tracks.map((_, i) => trackMute.isSolo(i))

  const items = tracks
    .filter(t => !t.isConductorTrack)
    .map(t => {
      const i = tracks.indexOf(t)
      const selected = !isArrangeViewSelected && i === selectedTrackId

      return <TrackListItem
        key={i}
        name={t.displayName || `Track ${t.channel}`}
        instrument={t.instrumentName}
        mute={trackMutes[i]}
        solo={trackSolos[i]}
        selected={selected}
        trackId={i}
        volume={t.volume}
        pan={t.pan}
        onClick={() => onSelectTrack(i)}
        onClickSolo={() => onClickSolo(i)}
        onClickMute={() => onClickMute(i)}
        onClickDelete={() => onClickDelete(i)} />
    })

  return <div className="TrackList">
    <SideHeader title="Tracks" onClickTitle={onClickArrangeView}>
      <AddTrackButton onClick={onClickAddTrack} />
    </SideHeader>
    {items}
  </div>
}

export default inject(({ rootStore: { song, trackMute, rootViewStore, dispatch, router, services: { player } } }) => ({
  trackMute,
  song,
  player: { player },
  isArrangeViewSelected: rootViewStore.isArrangeViewSelected,
  onClickMute: trackId => dispatch("TOGGLE_MUTE_TRACK", { trackId }),
  onClickSolo: trackId => dispatch("TOGGLE_SOLO_TRACK", { trackId }),
  onClickDelete: trackId => dispatch("REMOVE_TRACK", { trackId }),
  onClickAddTrack: () => dispatch("ADD_TRACK"),
  onChangeName: e => dispatch("SET_TRACK_NAME", { name: e.target.value }),
  onSelectTrack: trackId => {
    router.pushTrack()
    dispatch("SELECT_TRACK", { trackId })
  },
  onClickArrangeView: () => {
    router.pushArrange()
  }
}))(observer(TrackList))
