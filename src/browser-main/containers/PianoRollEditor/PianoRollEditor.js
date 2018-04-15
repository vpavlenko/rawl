import React from "react"
import { observer, inject } from "mobx-react"

import Icon from "components/Icon.tsx"
import Knob from "components/inputs/Knob.tsx"
import Slider from "components/inputs/Slider.tsx"
import NavigationBar from "components/groups/NavigationBar"
import { show as showInstrumentBrowser } from "components/InstrumentBrowser"

import PianoRoll from "./PianoRoll/PianoRoll"
import PianoRollToolbar from "./Toolbar/PianoRollToolbar"

import "./PianoRollEditor.css"

function PianoRollEditor({
  track,
  onChangeVolume,
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
          value={track.volume} />
        <Knob
          value={track.pan}
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

export default inject(({ rootStore: { song, router, dispatch } }) => {
  const track = song.selectedTrack
  const trackId = song.selectedTrackId
  return {
    track,
    onChangeVolume: value => dispatch("SET_TRACK_VOLUME", { trackId, volume: value }),
    onChangePan: value => dispatch("SET_TRACK_PAN", { trackId, pan: value }),
    onClickNavBack: () => router.pushArrange(),
    onClickInstrument: () => showInstrumentBrowser(song, trackId, (trackId, programNumber) => dispatch("SET_TRACK_INSTRUMENT", { trackId, programNumber }))
  }
})(observer(PianoRollEditor))
