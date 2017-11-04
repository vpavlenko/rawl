import ReactDOM from "react-dom"
import React from "react"
import { Helmet } from "react-helmet"
import path from "path"
import _ from "lodash"
import { observer, inject } from "mobx-react"
import DevTools from "mobx-react-devtools"

import Popup from "components/Popup"
import InstrumentBrowser from "components/InstrumentBrowser"

import TempoEditor from "../TempoEditor/TempoEditor"
import ArrangeView from "../ArrangeView/ArrangeView"
import TransportPanel from "../TransportPanel/TransportPanel"
import PianoRollEditor from "../PianoRollEditor/PianoRollEditor"

import mainManu from "menus/mainMenu"

import {
  getGMMapIndexes,
  getGMMapProgramNumber
} from "../../midi/GM.js"

import "./Resizer.css"
import "./RootView.css"

const { remote } = window.require("electron")
const { Menu } = remote

function RootView({
  player,
  song,
  dispatch,
  isArrangeViewSelected,
}) {
  const { selectedTrack } = song

  const onClickTrackInstrument = trackId => {
    const track = song.getTrack(trackId)
    const popup = new Popup()
    popup.show()

    const programNumber = track.programNumber
    const ids = getGMMapIndexes(programNumber)

    ReactDOM.render(<InstrumentBrowser
      isRhythmTrack={track.isRhythmTrack}
      selectedCategoryId={ids[0]}
      selectedInstrumentId={ids[1]}

      onClickCancel={() => {
        popup.close()
      }}

      onClickOK={({ isRhythmTrack, categoryId, instrumentId }) => {

        if (isRhythmTrack) {
          track.changeChannel(9)
          dispatch("SET_TRACK_INSTRUMENT", { trackId, programNumber: 0 })
        } else {
          if (track.isRhythmTrack) {
            // 適当なチャンネルに変える
            const channels = _.range(16)
            const usedChannels = song.tracks.filter(t => t !== track).map(t => t.channel)
            const availableChannel = _.min(_.difference(channels, usedChannels)) || 0
            track.changeChannel(availableChannel)
          }
          const programNumber = getGMMapProgramNumber(categoryId, instrumentId)
          dispatch("SET_TRACK_INSTRUMENT", { trackId, programNumber })
        }

        popup.close()
      }}
    />, popup.getContentElement())
  }

  const menu = mainManu(song, dispatch)
  Menu.setApplicationMenu(menu)

  const fileName = path.basename(song.filepath.replace(/\\/g, "/"))

  const content = isArrangeViewSelected ? <ArrangeView /> :
    (selectedTrack.isConductorTrack ? <TempoEditor /> : <PianoRollEditor />)

  return <div className="RootView">
    <Helmet><title>{`${song.name} (${fileName}) ― signal`}</title></Helmet>
    {content}
    <TransportPanel />
    <DevTools />
  </div>
}

export default inject(({ rootStore: { pianoRollStore, rootViewStore, song, services: { player }, dispatch } }) => ({
  isArrangeViewSelected: rootViewStore.isArrangeViewSelected,
  song,
  player,
  dispatch
}))(observer(RootView))
