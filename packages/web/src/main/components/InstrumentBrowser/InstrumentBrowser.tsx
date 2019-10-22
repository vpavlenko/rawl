import React, { Component } from "react"
import _ from "lodash"

import { getGMCategory } from "midi/GM.ts"

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
  programNumber: number
  isRhythmTrack: boolean
}

export interface InstrumentBrowserProps {
  isOpen: boolean
  programNumber: number
  isRhythmTrack: boolean
  presetCategories: PresetCategory[]
  onClickOK: (result: Result) => void
  onClickCancel: () => void
}

export interface InstrumentBrowserState {
  programNumber: number
  isRhythmTrack: boolean
}

export interface PresetItem {
  name: string
  programNumber: number
}

export interface PresetCategory {
  name: string
  presets: PresetItem[]
}

class InstrumentBrowser extends Component<
  InstrumentBrowserProps,
  InstrumentBrowserState
> {
  constructor(props: InstrumentBrowserProps) {
    super(props)

    this.state = {
      programNumber: props.programNumber,
      isRhythmTrack: props.isRhythmTrack
    }
  }

  render() {
    const { isRhythmTrack, programNumber } = this.state
    const {
      onClickCancel,
      onClickOK: _onClickOK,
      isOpen,
      presetCategories
    } = this.props

    const onClickOK = () => {
      _onClickOK({
        programNumber: this.state.programNumber,
        isRhythmTrack: this.state.isRhythmTrack
      })
    }

    const selectedCategoryId = Math.floor(programNumber / 8)

    const onChangeCategory = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (selectedCategoryId !== e.target.selectedIndex) {
        this.setState({
          programNumber: e.target.selectedIndex * 8 // カテゴリの最初の楽器を選ぶ
        })
      }
    }

    const onChangeInstrument = (e: React.ChangeEvent<HTMLSelectElement>) => {
      // TODO: play note (一時的に program change する)
      this.setState({
        programNumber: parseInt(e.target.value)
      })
    }

    const onChangeRhythmTrack = (e: React.ChangeEvent<HTMLInputElement>) => {
      this.setState({ isRhythmTrack: e.target.checked })
    }

    const instruments =
      presetCategories.length > selectedCategoryId
        ? presetCategories[selectedCategoryId].presets
        : []

    const categoryOptions = presetCategories.map(
      (preset: PresetCategory, i: number) => {
        return (
          <option key={i} value={i}>
            {preset.name}
          </option>
        )
      }
    )

    const instrumentOptions = instruments.map((p: PresetItem, i: number) => {
      return (
        <option key={i} value={p.programNumber}>
          {p.name}
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
                  value={programNumber}
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

      if (track === undefined) {
        throw new Error("selectedTrack is undefined")
      }

      const programNumber =
        track.programNumber !== undefined ? track.programNumber : 0
      const close = () => (s.openInstrumentBrowser = false)
      const setTrackInstrument = (programNumber: number) =>
        dispatch(SET_TRACK_INSTRUMENT, trackId, programNumber)

      const presets: PresetItem[] = Object.keys(s.presetNames[0]).map(key => ({
        programNumber: parseInt(key),
        name: s.presetNames[0][parseInt(key)]
      }))

      const presetCategories = _.map(
        _.groupBy(presets, p => getGMCategory(p.programNumber)),
        (presets, name) => ({ name, presets })
      )

      // TODO: presets をカテゴライズする

      return {
        isOpen: s.openInstrumentBrowser,
        isRhythmTrack: track.isRhythmTrack,
        programNumber: programNumber,
        onClickCancel: () => {
          close()
        },
        onClickOK: ({ isRhythmTrack, programNumber }) => {
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
            setTrackInstrument(programNumber)
          }

          close()
        },
        presetCategories
      } as InstrumentBrowserProps
    }
  ),
  observer
)(InstrumentBrowser)
