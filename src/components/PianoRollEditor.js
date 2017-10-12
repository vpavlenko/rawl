import React, { Component } from "react"

import Icon from "./Icon"
import Slider from "./inputs/Slider"
import Knob from "./inputs/Knob"

import "./PianoRollEditor.css"

export default function PianoRollEditor({ selectedTrack, pianoRoll }) {

  const onClickInstrument = () => { }
  const onClickSolo = () => { }
  const onClickMute = () => { }
  const onChangeVolume = () => { }
  const onChangePan = () => { }
  const mute = false
  const solo = false
  const volume = 80
  const pan = 64

  return <div className="PianoRollEditor">
    <nav>
      <div className="title"><Icon>chevron-left</Icon>{selectedTrack.displayName}</div>
      <div className="controls">
        <div className="button instrument" onClick={onClickInstrument}><Icon>piano</Icon>{selectedTrack.instrumentName}</div>
        <div className={`button solo ${solo ? "active" : ""}`} onClick={onClickSolo}><Icon>headphones</Icon><label>solo</label></div>
        <div className={`button mute ${mute ? "active" : ""}`} onClick={onClickMute}><Icon>{mute ? "volume-off" : "volume-high"}</Icon><label>mute</label></div>
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
    </nav>
    {pianoRoll}
  </div>
}
