import ReactDOM from "react-dom"
import React, { Component } from "react"
import SplitPane  from "react-split-pane"
import { Helmet } from "react-helmet"

import Song from "../model/Song"
import Track from "../model/Track"
import Config from "../Config"
import Popup from "./Popup"

import TrackList from "./TrackList"
import Toolbar from "./MainToolbar"
import InstrumentBrowser from "./InstrumentBrowser"
import PianoRoll from "./PianoRoll"

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
  return <div style={{position: "relative", height: "100%"}}>
    <SplitPane {...props} />
  </div>
}

export default class RootView extends Component {
  constructor(props) {
    super(props)

    this.state = {
      pianoRollMouseMode: 0,
      pianoRollScaleX: 1,
      pianoRollScaleY: 1,
      pianoRollAutoScroll: true,
      quantize: props.app.quantizer.denominator
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
      switch(e.keyCode) {
        case 32: {
          const { player } = this.props.app
          if (player.isPlaying) {
            player.stop()
          } else {
            player.play()
          }
          e.preventDefault()
          break
        }
        default: break
      }
    }
  }

  render() {
    const { props, state } = this
    const { app } = props
    const { song, player, quantizer } = app
    const { selectedTrack, selectedTrackId } = song

    const onClickKey = () => {

    }

    const onClickPencil = () => {
      this.setState({pianoRollMouseMode: 0})
    }

    const onClickSelection = () => {
      this.setState({pianoRollMouseMode: 1})
    }

    const onClickRuler = tick => {
      if (!player.isPlaying) {
        player.position = tick
      }
    }

    const onChangeTool = () => {
      this.setState({
        pianoRollMouseMode: state.pianoRollMouseMode === 0 ? 1 : 0
      })
    }

    const onClickScaleUp = () => {
      this.setState({
        pianoRollScaleX: state.pianoRollScaleX + 0.1
      })
    }

    const onClickScaleDown = () => {
      this.setState({
        pianoRollScaleX: Math.max(0.05, state.pianoRollScaleX - 0.1),
      })
    }

    const onSelectQuantize = e => {
      const value = parseFloat(e.target.value)
      quantizer.denominator = value
      this.setState({
        quantize: value
      })
    }

    const onClickAutoScroll = () => {
      this.setState({
        pianoRollAutoScroll: !state.pianoRollAutoScroll
      })
    }

    const onChangeTrackName = (e) => {
      selectedTrack.setName(e.target.value)
    }

    const onChangeTrackVolume = (trackId, value) => {
      const track = song.getTrack(trackId)
      track.volume = value
    }

    const onChangeTrackPan = (trackId, value) => {
      const track = song.getTrack(trackId)
      track.pan = value
    }

    const onClickTrackInstrument = trackId => {
      const track = song.getTrack(trackId)
      const popup = new Popup()
      popup.show()

      const programNumber = track.programNumber
      const ids = getGMMapIndexes(programNumber)

      ReactDOM.render(<InstrumentBrowser
        selectedCategoryId={ids[0]}
        selectedInstrumentId={ids[1]}

        onClickCancel={() => {
          popup.close()
        }}

        onClickOK={(e) => {
          track.programNumber = getGMMapProgramNumber(e.categoryId, e.instrumentId)
          popup.close()
        }}
      />, popup.getContentElement())
    }

    const onClickAddTrack = () => {
      song.addTrack(Track.emptyTrack(song.tracks.length - 1))
    }

    const onClickMute = (trackId) => {
      const channel = song.getTrack(trackId).channel
      const muted = player.isChannelMuted(channel)
      player.muteChannel(channel, !muted)
    }

    const onClickSolo = (trackId) => {
      const channel = song.getTrack(trackId).channel
      song.tracks.forEach((t, i) => {
        player.muteChannel(t.channel, t.channel !== channel)
      })
    }

    const onClickDeleteTrack = (trackId) => {
      song.removeTrack(trackId)
    }

    const changeTrack = (id) => {
      song.selectTrack(id)
    }

    const onChangeTempo = e => {
      song.getTrack(0).tempo = parseFloat(e.target.value)
    }

    const onClickPlay = () => {
      player.play()
    }

    const onClickStop = () => {
      if (player.isPlaying) {
        player.stop()
      } else {
        player.stop()
        player.position = 0
      }
    }

    const onClickBackward = () => {
      player.position -= Config.TIME_BASE * 4
    }

    const onClickForward = () => {
      player.position += Config.TIME_BASE * 4
    }

    const toolbar = <Toolbar
      player={player}
      measureList={song.measureList}
      quantize={state.quantize}
      mouseMode={state.pianoRollMouseMode}
      autoScroll={state.pianoRollAutoScroll}
      onClickPlay={onClickPlay}
      onClickStop={onClickStop}
      onClickBackward={onClickBackward}
      onClickForward={onClickForward}
      onClickPencil={onClickPencil}
      onClickSelection={onClickSelection}
      onClickScaleUp={onClickScaleUp}
      onClickScaleDown={onClickScaleDown}
      onSelectQuantize={onSelectQuantize}
      onClickAutoScroll={onClickAutoScroll}
    />

    const pianoRoll = <PianoRoll
      track={selectedTrack}
      quantizer={quantizer}
      player={player}
      endTick={song.endOfSong}
      scaleX={state.pianoRollScaleX}
      scaleY={state.pianoRollScaleY}
      autoScroll={state.pianoRollAutoScroll}
      onChangeTool={onChangeTool}
      onClickRuler={onClickRuler}
      onClickKey={onClickKey}
      mouseMode={state.pianoRollMouseMode}
      toggleMouseMode={() => this.setState({
        pianoRollMouseMode: this.state.pianoRollMouseMode === 0 ? 1 : 0
      })}
    />

    const menu = Menu.buildFromTemplate([
      {
        label: "File",
        submenu: [
          {
            label: "New",
            click: () => {
              app.song = Song.emptySong()
            }
          },
          {
            label: "Open",
            click: () => {
              dialog.showOpenDialog({filters: [{
                name: "Standard MIDI File",
                extensions: ["mid", "midi"]
              }]}, files => {
                if (files) {
                  app.open(files[0])
                }
              })
            }
          },
          {
            label: "Save",
            click: () => {
              app.saveSong(song.filepath)
            }
          },
          {
            label: "Save As",
            click: () => {
              dialog.showSaveDialog({filters: [{
                name: "Standard MIDI File",
                extensions: ["mid", "midi"]
              }]}, filepath => {
                app.saveSong(filepath)
              })
            }
          }
        ]
      },
      {
        label: "Edit",
        submenu: [
          {
            label: "Undo"
          },
          {
            label: "Redo"
          }
        ]
      }
    ])

    Menu.setApplicationMenu(menu)

    const trackList =
      <TrackList
        player={player}
        tracks={(song && song.tracks) || []}
        tempo={song.getTrack(0).tempo}
        onChangeTempo={onChangeTempo}
        selectedTrackId={selectedTrackId}
        onSelectTrack={changeTrack}
        onClickAddTrack={onClickAddTrack}
        onClickMute={onClickMute}
        onClickSolo={onClickSolo}
        onChangeName={onChangeTrackName}
        onChangeVolume={onChangeTrackVolume}
        onChangePan={onChangeTrackPan}
        onClickInstrument={onClickTrackInstrument}
        onClickDelete={onClickDeleteTrack}
      />

    const tempoGraph = <TempoGraph
      track={selectedTrack}
      player={player}
      endTick={song.endOfSong} />

    return <div className="RootView">
      <Helmet><title>{song.name} ― signal</title></Helmet>
      {toolbar}
      <Pane split="vertical" minSize={200} defaultSize={265} maxSize={400}>
        {trackList}
        {selectedTrack.isConductorTrack ? tempoGraph : pianoRoll}
      </Pane>
    </div>
  }
}
