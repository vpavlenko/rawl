import React, { Component } from "react"
import { getInstrumentName } from "../gm"

function TrackInfoContent(props) {
  const track = props.track
  const programChangeEvent = track && track.findProgramChangeEvents()[0]
  const volumeEvent = track && track.findVolumeEvents()[0]
  const panEvent = track && track.findPanEvents()[0]
  const fields = {
    name: track && track.getName(),
    instrument: programChangeEvent ? getInstrumentName(programChangeEvent.value) : "",
    volume: volumeEvent ? volumeEvent.value : "",
    pan: panEvent ? panEvent.value : ""
  }
  return <div className="track-info">
    <ul>
      <li className="name">
        <input type="text" value={ fields.name } placeholder="Track Name" onChange={props.onChangeName} />
      </li>
      <li>
        <label>Instrument</label>
        <input type="text" value={ fields.instrument } onClick={props.onClickInstrument} />
      </li>
      <li>
        <label>Volume</label>
        <input type="text" value={ fields.volume } onChange={props.onChangeVolume} />
      </li>
      <li>
        <label>Pan</label>
        <input type="text" value={ fields.pan } onChange={props.onChangePan} />
      </li>
    </ul>
  </div>
}

export default class TrackInfo extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    return <TrackInfoContent {...this.props} />
  }
}
