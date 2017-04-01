import React, { Component } from "react"
import SharedService from "../services/SharedService"

import "./TrackList.css"

function TrackListItem({
  track,
  onClickName,
  onClickSolo,
  onClickMute
}) {
  function _onClickName() { onClickName(track.trackId) }
  function _onClickSolo() { onClickSolo(track.trackId) }
  function _onClickMute() { onClickMute(track.trackId) }

  return <li className={track.selected ? "selected" : ""}>
    <p className="name" onClick={_onClickName}>{track.name}</p>
    <p className="solo" onClick={_onClickSolo}>S</p>
    <p className="mute" onClick={_onClickMute}>{track.mute ? "\uE618" : "\uE617"}</p>
  </li>
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
      name: `${t.channel + 1}. ${t.getName() || ""}`,
      mute: channelMutes[t.channel],
      selected: i == selectedTrackId,
      trackId: i
    }))
    .map(t => <TrackListItem
      key={t.trackId}
      track={t}
      onClickName={onSelectTrack}
      onClickSolo={onClickSolo}
      onClickMute={onClickMute} />)

  return <div className="track-list">
    <ul>
      {items}
      <li className="add-track" onClick={onClickAddTrack}><span className="icon">{"\uE608"}</span> Add Track</li>
    </ul>
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
