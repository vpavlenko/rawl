import React, { Component } from "react"
import SharedService from "../shared-service"

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
    <ul>{items}</ul>
    <p className="add-track" onClick={props.onClickAddTrack}><span className="icon">{"\uE608"}</span> Add Track</p>
  </div>
}

export default class TrackList extends Component {
  constructor(props) {
    super(props)

    this.state = {
      tracks: [],
      channelMutes: {},
      selectedTrackId: 0
    }
  }

  componentDidMount() {
    SharedService.player.on("change-mute", () => {
      this.setState({
        channelMutes: SharedService.player.channelMutes
      })
    })     
  }

  render() {
    const tracks = this.state.tracks.map((t, i) => {
      return {
        name: `${i} ${t.channel}. ${t.name || ""}`,
        mute: this.state.channelMutes[t.channel],
        selected: i == this.state.selectedTrackId,
        trackId: i
      }
    })

    return <TrackListContent {...this.props} tracks={tracks} />
  }
}
