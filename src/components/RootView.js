import ReactDOM from "react-dom"
import React, { Component } from "react"
import SplitPane from "react-split-pane"
import { Helmet } from "react-helmet"
import path from "path"
import _ from "lodash"

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

export default class RootView extends Component {
  constructor(props) {
    super(props)

    this.state = {
      pianoRollMouseMode: 0,
      pianoRollScaleX: 1,
      pianoRollScaleY: 1,
      pianoRollAutoScroll: true,
      quantize: props.app.quantizer.denominator,
      isArrangeViewSelected: false
    }
  }

  get selectedTrack() {
    return this.props.song && this.props.song.selectedTrack
  }

  componentDidMount() {
    this.initKeyboardShortcut()
  }

  initKeyboardShortcut() {
    document.onkeydown = e => {
      if (e.target !== document.body) {
        return
      }
      switch (e.code) {
        case "Space": {
          const { player } = this.props.app
          if (player.isPlaying) {
            player.stop()
          } else {
            player.play()
          }
          e.preventDefault()
          break
        }
        case "KeyZ": {
          if (e.ctrlKey) {
            this.props.dispatch("UNDO")
          }
          break
        }
        case "KeyY": {
          if (e.ctrlKey) {
            this.props.dispatch("REDO")
          }
          break
        }
        default: break
      }
    }
  }

  render() {
    const { props, state } = this
    const { app, song, theme, pianoSelection } = props
    const { player, quantizer, trackMute } = app
    const { selectedTrack, selectedTrackId } = song

    const {
      pianoRollScaleX,
      pianoRollScaleY,
      pianoRollAutoScroll,
      pianoRollMouseMode,
      isArrangeViewSelected,
      quantize
    } = state

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
          this.setState({
            pianoRollMouseMode: pianoRollMouseMode === 0 ? 1 : 0
          })
          break
        default:
          return this.props.dispatch(type, params)
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
      onClickPencil={() => this.setState({ pianoRollMouseMode: 0 })}
      onClickSelection={() => this.setState({ pianoRollMouseMode: 1 })}
      onClickScaleUp={() => this.setState({ pianoRollScaleX: pianoRollScaleX + 0.1 })}
      onClickScaleDown={() => this.setState({ pianoRollScaleX: Math.max(0.05, pianoRollScaleX - 0.1) })}
      onClickAutoScroll={() => this.setState({ pianoRollAutoScroll: !pianoRollAutoScroll })}
      onSelectQuantize={e => {
        dispatch("SET_QUANTIZE_DENOMINATOR", { denominator: e.denominator })
        this.setState({ quantize: e.denominator })
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
      onChangeTool={() => this.setState({ pianoRollMouseMode: pianoRollMouseMode === 0 ? 1 : 0 })}
      onClickKey={() => { }}
      mouseMode={pianoRollMouseMode}
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
          this.setState({ isArrangeViewSelected: false })
          dispatch("SELECT_TRACK", { trackId })
        }}
        onClickInstrument={onClickTrackInstrument}
        onClickArrangeView={() => this.setState({ isArrangeViewSelected: true })}
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
}
