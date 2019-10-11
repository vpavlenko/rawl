import React, { Component } from "react"
import _ from "lodash"

import { GMMap, getGMMapIndexes, getGMMapProgramNumber } from "midi/GM.ts"

import "./InstrumentBrowser.css"
import {
  Button,
  Dialog,
  DialogActions,
  FormControlLabel,
  Checkbox
} from "@material-ui/core"
import { compose } from "recompose"
import { inject, observer } from "mobx-react"
import RootStore from "stores/RootStore"
import { SET_TRACK_INSTRUMENT } from "actions"

export interface Result {
  categoryId: number
  instrumentId: number
  isRhythmTrack: boolean
}

export interface InstrumentBrowserProps {
  isOpen: boolean
  selectedCategoryId: number
  selectedInstrumentId: number
  isRhythmTrack: boolean
  onClickOK: (result: Result) => void
  onClickCancel: () => void
}

export interface InstrumentBrowserState {
  selectedCategoryId: number
  selectedInstrumentId: number
  isRhythmTrack: boolean
}

class InstrumentBrowser extends Component<
  InstrumentBrowserProps,
  InstrumentBrowserState
> {
  constructor(props: InstrumentBrowserProps) {
    super(props)

    this.state = {
      selectedCategoryId: props.selectedCategoryId || 0,
      selectedInstrumentId: props.selectedInstrumentId || 0,
      isRhythmTrack: props.isRhythmTrack
    }
  }

  render() {
    const {
      isRhythmTrack,
      selectedCategoryId,
      selectedInstrumentId
    } = this.state
    const { onClickCancel, onClickOK: _onClickOK, isOpen } = this.props

    const onClickOK = () => {
      _onClickOK({
        categoryId: this.state.selectedCategoryId,
        instrumentId: this.state.selectedInstrumentId,
        isRhythmTrack: this.state.isRhythmTrack
      })
    }

    const onChangeCategory = (e: React.ChangeEvent<HTMLSelectElement>) => {
      this.setState({
        selectedCategoryId: e.target.selectedIndex
      })
    }

    const onChangeInstrument = (e: React.ChangeEvent<HTMLSelectElement>) => {
      // TODO: play note (一時的に program change する)
      this.setState({
        selectedInstrumentId: e.target.selectedIndex
      })
    }

    const onChangeRhythmTrack = (e: React.ChangeEvent<HTMLInputElement>) => {
      this.setState({ isRhythmTrack: e.target.checked })
    }

    const categories = Object.keys(GMMap)
    const instruments = GMMap[Object.keys(GMMap)[this.state.selectedCategoryId]]

    const categoryOptions = categories.map((name: string, i: number) => {
      return (
        <option key={i} value={i}>
          {name}
        </option>
      )
    })

    const instrumentOptions = instruments.map((name: string, i: number) => {
      return (
        <option key={i} value={i}>
          {name}
        </option>
      )
    })

    return (
      <Dialog open={isOpen} onClose={onClickCancel}>
        <div className="InstrumentBrowser">
          <div className="container">
            <div className={`finder ${isRhythmTrack ? "disabled" : ""}`}>
              <div className="left">
                <label>Categories</label>
                <select
                  size={12}
                  onChange={onChangeCategory}
                  value={selectedCategoryId}
                >
                  {categoryOptions}
                </select>
              </div>
              <div className="right">
                <label>Instruments</label>
                <select
                  size={12}
                  onChange={onChangeInstrument}
                  value={selectedInstrumentId}
                >
                  {instrumentOptions}
                </select>
              </div>
            </div>
            <div className="footer">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isRhythmTrack}
                    onChange={onChangeRhythmTrack}
                    color="primary"
                  />
                }
                label="Rhythm Track"
              />
            </div>
          </div>
        </div>
        <DialogActions>
          <Button onClick={onClickCancel}>Cancel</Button>
          <Button color="primary" onClick={onClickOK}>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default compose(
  inject(
    ({
      rootStore: { pianoRollStore: s, song, dispatch }
    }: {
      rootStore: RootStore
    }) => {
      const track = song.selectedTrack
      const trackId = song.selectedTrackId

      const programNumber = track.programNumber
      const ids = getGMMapIndexes(programNumber)
      const close = () => (s.openInstrumentBrowser = false)
      const setTrackInstrument = (programNumber: number) =>
        dispatch(SET_TRACK_INSTRUMENT, trackId, programNumber)

      return {
        isOpen: s.openInstrumentBrowser,
        isRhythmTrack: track.isRhythmTrack,
        selectedCategoryId: ids[0],
        selectedInstrumentId: ids[1],
        onClickCancel: () => {
          close()
        },
        onClickOK: ({ isRhythmTrack, categoryId, instrumentId }) => {
          if (isRhythmTrack) {
            track.channel = 9
            setTrackInstrument(0)
          } else {
            if (track.isRhythmTrack) {
              // 適当なチャンネルに変える
              const channels = _.range(16)
              const usedChannels = song.tracks
                .filter(t => t !== track)
                .map(t => t.channel)
              const availableChannel =
                _.min(_.difference(channels, usedChannels)) || 0
              track.channel = availableChannel
            }
            const programNumber = getGMMapProgramNumber(
              categoryId,
              instrumentId
            )
            setTrackInstrument(programNumber)
          }

          close()
        }
      } as InstrumentBrowserProps
    }
  ),
  observer
)(InstrumentBrowser)
