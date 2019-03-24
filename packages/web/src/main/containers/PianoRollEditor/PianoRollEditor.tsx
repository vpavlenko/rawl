import React, { StatelessComponent } from "react"
import { observer, inject } from "mobx-react"
import { compose } from "recompose"

import Icon from "components/outputs/Icon"
import Knob from "components/inputs/Knob"
import Slider from "components/inputs/Slider"
import NavigationBar from "components/groups/NavigationBar"
import { show as showInstrumentBrowser } from "components/InstrumentBrowser/InstrumentBrowser"
import Track from "common/track/Track"

import PianoRoll from "./PianoRoll/PianoRoll"
import PianoRollToolbar from "./PianoRollToolbar"

import "./PianoRollEditor.css"
import {
  SET_TRACK_VOLUME,
  SET_TRACK_PAN,
  SET_TRACK_INSTRUMENT
} from "main/actions"
import RootStore from "src/main/stores/RootStore"

interface PianoRollEditorProps {
  track: Track
  onChangeVolume: (e: any) => void
  onChangePan: (e: any) => void
  onClickInstrument: (e: any) => void
  onClickNavBack: (e: any) => void
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
            onChange={value => onChangeVolume(value)}
            maxValue={127}
            value={track.volume}
          />
          <Knob
            value={track.pan}
            onChange={value => onChangePan(value)}
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
  inject(
    ({ rootStore: { song, router, dispatch } }: { rootStore: RootStore }) => {
      const track = song.selectedTrack
      const trackId = song.selectedTrackId
      return {
        track,
        onChangeVolume: value => dispatch(SET_TRACK_VOLUME, trackId, value),
        onChangePan: value => dispatch(SET_TRACK_PAN, trackId, value),
        onClickNavBack: () => router.pushArrange(),
        onClickInstrument: () =>
          showInstrumentBrowser(song, trackId, (trackId, programNumber) =>
            dispatch(SET_TRACK_INSTRUMENT, { trackId, programNumber })
          )
      } as PianoRollEditorProps
    }
  ),
  observer
)(PianoRollEditor)
