import React, { Component } from "react"
import SharedService from "../services/SharedService"
import Icon from "./atoms/Icon"
import Slider from "./atoms/Slider"
import Knob from "./atoms/Knob"

import "./TrackList.css"

const Nop = () => {}

function TrackListItem({
  track,
  onClick = Nop,
  onDoubleClickName = Nop,
  onClickSolo = Nop,
  onClickMute = Nop
}) {
  function _onClick(e) {
    e.stopPropagation()
    onClick(track.trackId)
  }
  function _onDoubleClickName(e) {
    e.stopPropagation()
    onDoubleClickName(track.trackId)
  }
  function _onClickSolo(e) {
    e.stopPropagation()
    onClickSolo(track.trackId)
  }
  function _onClickMute(e) {
    e.stopPropagation()
    onClickMute(track.trackId)
  }
  function _onClickInstrument(e) {
    // TODO: open instrument browser
  }

  return <div
    className={`TrackListItem ${track.selected ? "selected" : ""}`}
    onClick={_onClick}>
    <div className="name" onDoubleClick={_onDoubleClickName}>{track.name}</div>
    <div className="controls">
      <div className="button" onClick={_onClickInstrument}><Icon>piano</Icon></div>
      <div className="button" onClick={_onClickSolo}><Icon>headphones</Icon></div>
      <div className="button" onClick={_onClickMute}><Icon>{track.mute ? "volume-off" : "volume-high"}</Icon></div>
      <Slider />
      <Knob
        minValue={-100}
        maxValue={100}
        offsetDegree={0}
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
  onClickAddTrack
}) {
  const items = tracks
    .map((t, i) => ({
      name: t.getName() || `Track ${t.channel}`, // TODO: show instrument name by default
      mute: channelMutes[t.channel],
      selected: i == selectedTrackId,
      trackId: i
    }))
    .map(t => <TrackListItem
      key={t.trackId}
      track={t}
      onClick={onSelectTrack}
      onClickSolo={onClickSolo}
      onClickMute={onClickMute} />)

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
