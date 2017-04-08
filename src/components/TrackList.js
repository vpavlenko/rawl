import React, { Component } from "react"
import SharedService from "../services/SharedService"
import Icon from "./atoms/Icon"
import Slider from "./atoms/Slider"
import Knob from "./atoms/Knob"

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
  onChangeVolume = Nop
}) {
  function _onClick(e) {
    e.stopPropagation()
    onClick()
  }
  function _onDoubleClickName(e) {
    e.stopPropagation()
    onDoubleClickName()
  }
  function _onClickSolo(e) {
    e.stopPropagation()
    onClickSolo()
  }
  function _onClickMute(e) {
    e.stopPropagation()
    onClickMute()
  }
  function _onClickInstrument(e) {
    // TODO: open instrument browser
  }
  function _onChangeVolume(e) {
    e.stopPropagation()
    onChangeVolume(e.target.value)
  }
  function _onChangePan(e) {
    e.stopPropagation()
    onChangePan(e.target.value)
  }

  return <div
    className={`TrackListItem ${selected ? "selected" : ""}`}
    onClick={_onClick}>
    <div className="name" onDoubleClick={_onDoubleClickName}>{name}</div>
    <div className="controls">
      <div className="button" onClick={_onClickInstrument}><Icon>piano</Icon></div>
      <div className="button" onClick={_onClickSolo}><Icon>headphones</Icon></div>
      <div className="button" onClick={_onClickMute}><Icon>{mute ? "volume-off" : "volume-high"}</Icon></div>
      <Slider
        onChange={_onChangeVolume}
        maxValue={127}
        value={volume} />
      <Knob
        value={pan}
        onChange={_onChangePan}
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
  onChangePan
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
        onChangePan={v => onChangePan(i, v)} />
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
    SharedService.player.on("change-mute", () => {
      const channelMutes = this.props.tracks.map((t, i) => SharedService.player.isChannelMuted(i))
      this.setState({ channelMutes })
    })
  }

  render() {
    return <TrackListContent {...this.props} channelMutes={this.state.channelMutes} />
  }
}
