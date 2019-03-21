import React, { Component } from "react"
import ReactDOM from "react-dom"
import _ from "lodash"

import { GMMap, getGMMapIndexes, getGMMapProgramNumber } from "midi/GM.ts"

import Popup from "components/Popup"

import "./InstrumentBrowser.css"
import Song from "src/common/song"

export interface Result {
  categoryId: number
  instrumentId: number
  isRhythmTrack: boolean
}

export interface InstrumentBrowserProps {
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

export default class InstrumentBrowser extends Component<
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
    const { onClickCancel } = this.props

    const onClickOK = () => {
      this.props.onClickOK({
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
            <label>
              <input
                type="checkbox"
                checked={isRhythmTrack}
                onChange={onChangeRhythmTrack}
              />
              Rhythm Track
            </label>
            <button className="ok" onClick={onClickOK}>
              OK
            </button>
            <button className="cancel" onClick={onClickCancel}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }
}

export function show(
  song: Song,
  trackId: number,
  setTrackInstrument: (trackId: number, programNumber: number) => void
) {
  const track = song.getTrack(trackId)
  const popup = new Popup()
  popup.show()

  const programNumber = track.programNumber
  const ids = getGMMapIndexes(programNumber)

  ReactDOM.render(
    <InstrumentBrowser
      isRhythmTrack={track.isRhythmTrack}
      selectedCategoryId={ids[0]}
      selectedInstrumentId={ids[1]}
      onClickCancel={() => {
        popup.close()
      }}
      onClickOK={({ isRhythmTrack, categoryId, instrumentId }) => {
        if (isRhythmTrack) {
          track.channel = 9
          setTrackInstrument(trackId, 0)
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
          const programNumber = getGMMapProgramNumber(categoryId, instrumentId)
          setTrackInstrument(trackId, programNumber)
        }

        popup.close()
      }}
    />,
    popup.getContentElement()
  )
}
