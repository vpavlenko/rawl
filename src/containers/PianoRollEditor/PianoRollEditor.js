import React from "react"
import { observer, inject } from "mobx-react"

import Icon from "components/Icon"
import Knob from "components/inputs/Knob"
import Slider from "components/inputs/Slider"
import NavigationBar from "components/groups/NavigationBar"

import PianoRoll from "./PianoRoll/PianoRoll"
import PianoRollToolbar from "./Toolbar/PianoRollToolbar"

import "./PianoRollEditor.css"

function PianoRollEditor({
  track,
  onClickNavBack
 }) {

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
    <NavigationBar title={track.displayName} onClickBack={onClickNavBack}>
      <div className="controls">
        <div className="button instrument" onClick={onClickInstrument}><Icon>piano</Icon>{track.instrumentName}</div>
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
    </NavigationBar>
    <PianoRollToolbar />
    <PianoRoll />
  </div>
}

export default inject(({ rootStore: { song, rootViewStore } }) => ({
  track: song.selectedTrack,
  onClickNavBack: () => rootViewStore.isArrangeViewSelected = true
}))(observer(PianoRollEditor))
