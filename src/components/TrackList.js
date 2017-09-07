import React, { Component } from "react"
import Icon from "./Icon"
import Slider from "./inputs/Slider"
import Knob from "./inputs/Knob"
import NumberInput from "./inputs/NumberInput"
import { ContextMenu, MenuItem, createContextMenu } from "./groups/ContextMenu"

import "./TrackList.css"

const Nop = () => {}

function TrackListItem({
  name = "",
  mute = false,
  solo = false,
  selected = false,
  volume = 0,
  pan = 0,
  onClick = Nop,
  onDoubleClickName = Nop,
  onClickSolo = Nop,
  onClickMute = Nop,
  onChangePan = Nop,
  onChangeVolume = Nop,
  onClickInstrument = Nop,
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
    <div className="name" onDoubleClick={onDoubleClickName}>{name}</div>
    <div className="controls">
      <div className="button instrument" onClick={onClickInstrument}><Icon>piano</Icon></div>
      <div className={`button solo ${solo ? "active" : ""}`} onClick={onClickSolo}><Icon>headphones</Icon></div>
      <div className={`button mute ${mute ? "active" : ""}`} onClick={onClickMute}><Icon>{mute ? "volume-off" : "volume-high"}</Icon></div>
      <Slider
        onChange={e => onChangeVolume(e.target.value)}
        maxValue={127}
        value={volume} />
      <Knob
        value={pan}
        onChange={e => onChangePan(e.target.value)}
        minValue={0}
        maxValue={127}
        offsetDegree={-140}
        maxDegree={280} />
    </div>
  </div>
}

function TempoTrackItem({
  selected = false,
  onClick = Nop,
  onChangeTempo = Nop,
  tempo = 0
}) {
  return  <div
    className={`TempoTrackItem ${selected ? "selected" : ""}`}
    onClick={onClick}
    >
    <div className="name">Tempo</div>
    <NumberInput value={tempo} onChange={onChangeTempo} minValue={0} maxValue={300} />
  </div>
}

function TrackListContent({
  tracks,
  tempo,
  onChangeTempo,
  trackMutes,
  trackSolos,
  selectedTrackId,
  onSelectTrack,
  onClickSolo,
  onClickMute,
  onClickAddTrack,
  onChangeVolume,
  onChangePan,
  onClickInstrument,
  onClickDelete
}) {
  const items = tracks
    .map((t, i) => {
      if (t.isConductorTrack) {
        return <TempoTrackItem
          key={i}
          onClick={() => onSelectTrack(i)}
          selected={i === selectedTrackId}
          tempo={tempo}
          onChangeTempo={onChangeTempo}
        />
      }

      return <TrackListItem
        key={i}
        name={t.displayName || `Track ${t.channel}`}
        mute={trackMutes[i]}
        solo={trackSolos[i]}
        selected={i === selectedTrackId}
        trackId={i}
        volume={t.volume}
        pan={t.pan}
        onClick={() => onSelectTrack(i)}
        onClickSolo={() => onClickSolo(i)}
        onClickMute={() => onClickMute(i)}
        onChangeVolume={v => onChangeVolume(i, v)}
        onChangePan={v => onChangePan(i, v)}
        onClickInstrument={() => onClickInstrument(i)}
        onClickDelete={() => onClickDelete(i)} />
    })

  return <div className="TrackList">
    {items}
    <div className="add-track" onClick={onClickAddTrack}><Icon>plus</Icon> Add Track</div>
  </div>
}

export default class TrackList extends Component {
  constructor(props) {
    super(props)

    this.state = {
      trackMutes: [],
      trackSolos: []
    }
  }

  componentDidMount() {
    this.props.trackMute.on("change-mute", this.onChangeMute)
  }

  componentWillUnmount() {
    this.props.trackMute.off("change-mute", this.onChangeMute)
  }

  onChangeMute = () => {
    const { tracks, trackMute } = this.props
    const trackMutes = tracks.map((_, i) => trackMute.isMuted(i))
    const trackSolos = tracks.map((_, i) => trackMute.isSolo(i))
    this.setState({ trackMutes, trackSolos })
  }

  render() {
    return <TrackListContent {...this.props} {...this.state} />
  }
}
