import React, { Component } from "react"
import { getInstrumentName } from "../midi/GM"

import "./TrackInfo.css"

export default function TrackInfoContent({
  track,
  onChangeName,
  onClickInstrument,
  onChangeVolume,
  onChangePan
}) {
  const programChangeEvent = track && track.findProgramChangeEvents()[0]
  const volumeEvent = track && track.findVolumeEvents()[0]
  const panEvent = track && track.findPanEvents()[0]
  const fields = {
    name: track.getName(),
    instrument: getInstrumentName(track.programNumber),
    volume: track.volume,
    pan: track.pan
  }
  return <div className="TrackInfo">
    <ul>
      <li className="name">
        <input type="text" value={ fields.name } placeholder="Track Name" onChange={onChangeName} />
      </li>
      <li>
        <label>Instrument</label>
        <input type="text" value={ fields.instrument } onClick={onClickInstrument} />
      </li>
      <li>
        <label>Volume</label>
        <input type="text" value={ fields.volume } onChange={onChangeVolume} />
      </li>
      <li>
        <label>Pan</label>
        <input type="text" value={ fields.pan } onChange={onChangePan} />
      </li>
    </ul>
  </div>
}
