import React, { Component } from "react"
import SharedService from "../services/SharedService"

import "./TrackList.css"

function TrackListItem(props) {
  function onClickName() { props.onClickName(props.track.trackId) }
  function onClickSolo() { props.onClickSolo(props.track.trackId) }
  function onClickMute() { props.onClickMute(props.track.trackId) }

  return <li className={props.track.selected ? "selected" : ""}>
    <p className="name" onClick={onClickName}>{props.track.name}</p>
    <p className="solo" onClick={onClickSolo}>S</p>
    <p className="mute" onClick={onClickMute}>{props.track.mute ? "\uE618" : "\uE617"}</p>
  </li>
}

function TrackListContent(props) {
  const items = props.tracks.map(t => <TrackListItem
    key={t.trackId}
    track={t}
    onClickName={props.onSelectTrack}
    onClickSolo={props.onClickSolo}
    onClickMute={props.onClickMute} />)

  return <div className="track-list">
    <ul>
      {items}
      <li className="add-track" onClick={props.onClickAddTrack}><span className="icon">{"\uE608"}</span> Add Track</li>
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
    const tracks = this.props.tracks.map((t, i) => {
      return {
        name: `${t.channel + 1}. ${t.getName() || ""}`,
        mute: this.state.channelMutes[t.channel],
        selected: i == this.props.selectedTrackId,
        trackId: i
      }
    })

    return <TrackListContent {...this.props} tracks={tracks} />
  }
}
