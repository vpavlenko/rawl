import React from "react"
import { observer, inject } from "mobx-react"

import Icon from "components/Icon"
import NumberInput from "components/inputs/NumberInput"
import { ContextMenu, MenuItem, createContextMenu } from "components/groups/ContextMenu"
import SideHeader from "components/Sidebar/Header"

import "./TrackList.css"

const Nop = () => { }

function TrackListItem({
  name = "",
  instrument = "",
  mute = false,
  solo = false,
  selected = false,
  volume = 0,
  pan = 0,
  onClick = Nop,
  onDoubleClickName = Nop,
  onClickSolo = Nop,
  onClickMute = Nop,
  onClickDelete = Nop
}) {
  return <div
    className={`TrackListItem ${selected ? "selected" : ""}`}
    onClick={onClick}
    onContextMenu={createContextMenu(close =>
      <ContextMenu id="TrackListItem">
        <MenuItem onClick={() => {
          onClickDelete()
          close()
        }}>Delete Track</MenuItem>
      </ContextMenu>
    )}>
    <div className="label">
      <div className="name" onDoubleClick={onDoubleClickName}>{name}</div>
      <div className="instrument">{instrument}</div>
    </div>
    <div className="controls">
      <div className={`button solo ${solo ? "active" : ""}`} onClick={onClickSolo}><Icon>headphones</Icon></div>
      <div className={`button mute ${mute ? "active" : ""}`} onClick={onClickMute}><Icon>{mute ? "volume-off" : "volume-high"}</Icon></div>
    </div>
  </div>
}

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
    <SideHeader title="Tracks" onClickTitle={onClickArrangeView} />
    {items}
    <div className="add-track" onClick={onClickAddTrack}><Icon>plus</Icon> Add Track</div>
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
