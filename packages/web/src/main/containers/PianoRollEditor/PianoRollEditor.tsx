import React, { StatelessComponent } from "react"
import { observer, inject } from "mobx-react"
import { compose } from "recompose"

import Icon from "components/Icon"
import Knob from "components/inputs/Knob"
import Slider from "components/inputs/Slider"
import NavigationBar from "components/groups/NavigationBar"
import { show as showInstrumentBrowser } from "components/InstrumentBrowser"
import Track from "common/track/Track"

import PianoRoll from "./PianoRoll/PianoRoll"
import PianoRollToolbar from "./Toolbar/PianoRollToolbar"

import "./PianoRollEditor.css"
import {
  SET_TRACK_VOLUME,
  SET_TRACK_PAN,
  SET_TRACK_INSTRUMENT
} from "main/actions"

interface PianoRollEditorProps {
  track: Track
  onChangeVolume: (any) => void
  onChangePan: (any) => void
  onClickInstrument: (any) => void
  onClickNavBack: (any) => void
}

const PianoRollEditor: StatelessComponent<PianoRollEditorProps> = ({
  track,
  onChangeVolume,
  onChangePan,
  onClickInstrument,
  onClickNavBack
}) => {
  return (
    <div className="PianoRollEditor">
      <NavigationBar title={track.displayName} onClickBack={onClickNavBack}>
        <div className="controls">
          <div className="button instrument" onClick={onClickInstrument}>
            <Icon>piano</Icon>
            {track.instrumentName}
          </div>
          <Slider
            onChange={e => onChangeVolume(e.target.value)}
            maxValue={127}
            value={track.volume}
          />
          <Knob
            value={track.pan}
            onChange={e => onChangePan(e.target.value)}
            minValue={0}
            maxValue={127}
            offsetDegree={-140}
            maxDegree={280}
          />
        </div>
      </NavigationBar>
      <PianoRollToolbar />
      <PianoRoll />
    </div>
  )
}

export default compose(
  inject(({ rootStore: { song, router, dispatch } }) => {
    const track = song.selectedTrack
    const trackId = song.selectedTrackId
    return {
      track,
      onChangeVolume: value =>
        dispatch(SET_TRACK_VOLUME, { trackId, volume: value }),
      onChangePan: value => dispatch(SET_TRACK_PAN, { trackId, pan: value }),
      onClickNavBack: () => router.pushArrange(),
      onClickInstrument: () =>
        showInstrumentBrowser(song, trackId, (trackId, programNumber) =>
          dispatch(SET_TRACK_INSTRUMENT, { trackId, programNumber })
        )
    }
  }),
  observer
)(PianoRollEditor)
