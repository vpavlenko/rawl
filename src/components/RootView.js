import ReactDOM from "react-dom"
import React from "react"
import SplitPane from "react-split-pane"
import { Helmet } from "react-helmet"
import path from "path"
import _ from "lodash"
import { observer, inject } from "mobx-react"

import { TIME_BASE } from "../Constants"
import Popup from "./Popup"

import TrackList from "./TrackList"
import Toolbar from "./MainToolbar"
import InstrumentBrowser from "./InstrumentBrowser"
import PianoRoll from "./PianoRoll/PianoRoll"
import ArrangeView from "./ArrangeView"

import {
  getGMMapIndexes,
  getGMMapProgramNumber
} from "../midi/GM.js"

import "./Resizer.css"
import "./RootView.css"

import TempoGraph from "./TempoGraph/TempoGraph"

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
  app,
  song,
  theme,
  dispatch: _dispatch,
  pianoSelection,
  pianoRollMouseMode,
  setPianoRollMouseMode,
  pianoRollScaleX,
  setPianoRollScaleX,
  pianoRollScaleY,
  setPianoRollScaleY,
  pianoRollAutoScroll,
  setPianoRollAutoScroll,
  quantize: _quantize,
  setQuantize,
  isArrangeViewSelected,
  setIsArrangeViewSelected
}) {
  const { player, quantizer, trackMute } = app
  const { selectedTrack, selectedTrackId } = song
  const quantize = _quantize === 0 ? quantizer.denominator : _quantize

  const onClickKey = () => {
  }

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

  const dispatch = (type, params) => {
    switch (type) {
      case "TOGGLE_TOOL":
        setPianoRollMouseMode(pianoRollMouseMode === 0 ? 1 : 0)
        break
      default:
        return _dispatch(type, params)
    }
  }

  const toolbar = <Toolbar
    player={player}
    measureList={song.measureList}
    quantize={quantize}
    mouseMode={pianoRollMouseMode}
    autoScroll={pianoRollAutoScroll}
    onClickPlay={() => dispatch("PLAY")}
    onClickStop={() => dispatch("STOP")}
    onClickBackward={() => dispatch("MOVE_PLAYER_POSITION", { tick: -TIME_BASE * 4 })}
    onClickForward={() => dispatch("MOVE_PLAYER_POSITION", { tick: TIME_BASE * 4 })}
    onClickPencil={() => setPianoRollMouseMode(0)}
    onClickSelection={() => setPianoRollMouseMode(1)}
    onClickScaleUp={() => setPianoRollScaleX(pianoRollScaleX + 0.1)}
    onClickScaleDown={() => setPianoRollScaleX(Math.max(0.05, pianoRollScaleX - 0.1))}
    onClickAutoScroll={() => setPianoRollAutoScroll(!pianoRollAutoScroll)}
    onSelectQuantize={e => {
      dispatch("SET_QUANTIZE_DENOMINATOR", { denominator: e.denominator })
      setQuantize(e.denominator)
    }}
  />

  const pianoRoll = <PianoRoll
    track={selectedTrack}
    quantizer={quantizer}
    player={player}
    endTick={song.endOfSong}
    beats={song.measureList.beats}
    scaleX={pianoRollScaleX}
    scaleY={pianoRollScaleY}
    autoScroll={pianoRollAutoScroll}
    onChangeTool={() => setPianoRollMouseMode(pianoRollMouseMode === 0 ? 1 : 0)}
    onClickKey={() => { }}
    dispatch={dispatch}
    theme={theme}
    selection={pianoSelection}
  />

  const menu = createMenu(song, dispatch)
  Menu.setApplicationMenu(menu)

  const trackList =
    <TrackList
      player={player}
      tracks={(song && song.tracks) || []}
      tempo={song.getTrack(0).tempo}
      selectedTrackId={selectedTrackId}
      isArrangeViewSelected={isArrangeViewSelected}
      trackMute={trackMute}
      onClickMute={trackId => dispatch("TOGGLE_MUTE_TRACK", { trackId })}
      onClickSolo={trackId => dispatch("TOGGLE_SOLO_TRACK", { trackId })}
      onClickDelete={trackId => dispatch("REMOVE_TRACK", { trackId })}
      onClickAddTrack={() => dispatch("ADD_TRACK")}
      onChangeName={e => dispatch("SET_TRACK_NAME", { name: e.target.value })}
      onChangeTempo={e => dispatch("SET_TEMPO", { tempo: parseFloat(e.target.value) })}
      onChangeVolume={(trackId, value) => dispatch("SET_TRACK_VOLUME", { trackId, volume: value })}
      onChangePan={(trackId, value) => dispatch("SET_TRACK_PAN", { trackId, pan: value })}
      onSelectTrack={trackId => {
        setIsArrangeViewSelected(false)
        dispatch("SELECT_TRACK", { trackId })
      }}
      onClickInstrument={onClickTrackInstrument}
      onClickArrangeView={() => setIsArrangeViewSelected(true)}
    />

  const tempoGraph = <TempoGraph
    pixelsPerTick={0.1 * pianoRollScaleX}
    track={song.conductorTrack}
    player={player}
    endTick={song.endOfSong}
    beats={song.measureList.beats}
    dispatch={dispatch}
    autoScroll={pianoRollAutoScroll}
  />

  const fileName = path.basename(song.filepath.replace(/\\/g, "/"))

  const arrangeView = <ArrangeView
    tracks={song.tracks}
    theme={theme}
    beats={song.measureList.beats}
    endTick={song.endOfSong}
    keyHeight={0.3}
    pixelsPerTick={0.1 * pianoRollScaleX}
    player={player}
    dispatch={dispatch}
    autoScroll={pianoRollAutoScroll}
  />

  const content = isArrangeViewSelected ? arrangeView :
    (selectedTrack.isConductorTrack ? tempoGraph : pianoRoll)

  return <div className="RootView">
    <Helmet><title>{song.name} ({fileName}) ― signal</title></Helmet>
    {toolbar}
    <Pane split="vertical" minSize={200} defaultSize={265} maxSize={400}>
      {trackList}
      {content}
    </Pane>
  </div>
}

export default inject(({ pianoRollStore, rootViewStore }) => ({
  pianoRollMouseMode: pianoRollStore.mouseMode,
  setPianoRollMouseMode: v => pianoRollStore.mouseMode = v,
  pianoRollScaleX: pianoRollStore.scaleX,
  setPianoRollScaleX: v => pianoRollStore.scaleX = v,
  pianoRollScaleY: pianoRollStore.scaleY,
  setPianoRollScaleY: v => pianoRollStore.scaleY = v,
  pianoRollAutoScroll: pianoRollStore.autoScroll,
  setPianoRollAutoScroll: v => pianoRollStore.autoScroll = v,
  quantize: pianoRollStore.quantize,
  setQuantize: v => pianoRollStore.quantize = v,
  isArrangeViewSelected: rootViewStore.isArrangeViewSelected,
  setIsArrangeViewSelected: v => rootViewStore.isArrangeViewSelected = v
}))(observer(RootView))