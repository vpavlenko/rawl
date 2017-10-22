import ReactDOM from "react-dom"
import React from "react"
import SplitPane from "react-split-pane"
import { Helmet } from "react-helmet"
import path from "path"
import _ from "lodash"
import { observer, inject } from "mobx-react"
import DevTools from "mobx-react-devtools"

import Popup from "components/Popup"
import InstrumentBrowser from "components/InstrumentBrowser"

import TransportPanel from "../TransportPanel/TransportPanel"
import TrackList from "../TrackList/TrackList"
import PianoRollEditor from "../PianoRollEditor/PianoRollEditor"
import TempoGraph from "../TempoGraph/TempoGraph"
import ArrangeView from "../ArrangeView/ArrangeView"

import {
  getGMMapIndexes,
  getGMMapProgramNumber
} from "../../midi/GM.js"

import "./Resizer.css"
import "./RootView.css"

const { remote } = window.require("electron")
const { Menu, dialog } = remote

function Pane(props) {
  return <div style={{ position: "relative", height: "100%" }}>
    <SplitPane {...props} />
  </div>
}

function createMenu(song, dispatch) {
  return Menu.buildFromTemplate([
    {
      label: "File",
      submenu: [
        {
          label: "New",
          click: () => {
            dispatch("CREATE_SONG")
          }
        },
        {
          label: "Open",
          click: () => {
            dialog.showOpenDialog({
              filters: [{
                name: "Standard MIDI File",
                extensions: ["mid", "midi"]
              }]
            }, files => {
              if (files) {
                dispatch("OPEN_SONG", { filepath: files[0] })
              }
            })
          }
        },
        {
          label: "Save",
          click: () => {
            dispatch("SAVE_SONG", { filepath: song.filepath })
          }
        },
        {
          label: "Save As",
          click: () => {
            dialog.showSaveDialog({
              defaultPath: song.filepath,
              filters: [{
                name: "Standard MIDI File",
                extensions: ["mid", "midi"]
              }]
            }, filepath => {
              dispatch("SAVE_SONG", { filepath })
            })
          }
        }
      ]
    },
    {
      label: "Edit",
      submenu: [
        {
          label: "Undo",
          click: () => dispatch("UNDO")
        },
        {
          label: "Redo",
          click: () => dispatch("REDO")
        }
      ]
    }
  ])
}

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

  const menu = createMenu(song, dispatch)
  Menu.setApplicationMenu(menu)

  const fileName = path.basename(song.filepath.replace(/\\/g, "/"))

  const content = isArrangeViewSelected ? <ArrangeView /> :
    (selectedTrack.isConductorTrack ? <TempoGraph /> : <PianoRollEditor />)

  return <div className="RootView">
    <Helmet><title>{`${song.name} (${fileName}) ― signal`}</title></Helmet>
    <Pane split="vertical" minSize={200} defaultSize={265} maxSize={400}>
      <TrackList onClickInstrument={onClickTrackInstrument} />
      {content}
    </Pane>
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
