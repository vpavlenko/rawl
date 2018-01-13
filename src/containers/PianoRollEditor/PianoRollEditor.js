import React from "react"
import { observer, inject } from "mobx-react"

import Icon from "components/Icon"
import Knob from "components/inputs/Knob"
import Slider from "components/inputs/Slider"
import NavigationBar from "components/groups/NavigationBar"
import { show as showInstrumentBrowser } from "components/InstrumentBrowser"

import PianoRoll from "./PianoRoll/PianoRoll"
import PianoRollToolbar from "./Toolbar/PianoRollToolbar"

import "./PianoRollEditor.css"

function PianoRollEditor({
  track,
  mute,
  onClickMute,
  volume,
  onChangeVolume,
  pan,
  onChangePan,
  onClickInstrument,
  onClickNavBack
 }) {
  return <div className="PianoRollEditor">
    <NavigationBar title={track.displayName} onClickBack={onClickNavBack}>
      <div className="controls">
        <div className="button instrument" onClick={onClickInstrument}><Icon>piano</Icon>{track.instrumentName}</div>
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

export default inject(({ rootStore: { song, router, trackMute, dispatch } }) => {
  const trackId = song.selectedTrackId
  return {
    track: song.selectedTrack,
    onChangeVolume: value => dispatch("SET_TRACK_VOLUME", { trackId, volume: value }),
    onChangePan: value => dispatch("SET_TRACK_PAN", { trackId, pan: value }),
    onClickNavBack: () => router.pushArrange(),
    volume: song.selectedTrack.volume,
    pan: song.selectedTrack.pan,
    onClickInstrument: () => showInstrumentBrowser(song, trackId, dispatch)
  }
})(observer(PianoRollEditor))
