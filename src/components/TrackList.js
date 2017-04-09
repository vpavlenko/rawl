import React, { Component } from "react"
import Icon from "./atoms/Icon"
import Slider from "./atoms/Slider"
import Knob from "./atoms/Knob"
import { ContextMenu, MenuItem, createContextMenu } from "./molecules/ContextMenu"

import "./TrackList.css"

const Nop = () => {}

function TrackListItem({
  name = "",
  mute = false,
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
      <div className="button" onClick={onClickInstrument}><Icon>piano</Icon></div>
      <div className="button" onClick={onClickSolo}><Icon>headphones</Icon></div>
      <div className="button" onClick={onClickMute}><Icon>{mute ? "volume-off" : "volume-high"}</Icon></div>
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

function TrackListContent({
  tracks,
  channelMutes,
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
      return <TrackListItem
        key={i}
        name={t.displayName || `Track ${t.channel}`}
        mute={channelMutes[t.channel]}
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
    <div className="add-track" onClick={onClickAddTrack}><span className="icon">{"\uE608"}</span> Add Track</div>
  </div>
}

export default class TrackList extends Component {
  constructor(props) {
    super(props)

    this.state = {
      channelMutes: {}
    }
  }

  componentDidMount() {
    const { player, tracks } = this.props
    player.on("change-mute", () => {
      const channelMutes = tracks.map((t, i) => player.isChannelMuted(i))
      this.setState({ channelMutes })
    })
  }

  render() {
    return <TrackListContent {...this.props} channelMutes={this.state.channelMutes} />
  }
}
