import ReactDOM from "react-dom"
import React, { Component } from "react"
import SplitPane  from "react-split-pane"

import SharedService from "../services/SharedService"
import Track from "../model/Track"
import PopupComponent from "./PopupComponent"
import Config from "../Config"

import TrackList from "./TrackList"
import TrackInfo from "./TrackInfo"
import Toolbar from "./MainToolbar"
import InstrumentBrowser from "./InstrumentBrowser"
import PropertyPane from "./PropertyPane"
import PianoRoll from "./PianoRoll"
import ArrangeView from "./ArrangeView"
import Button from "./atoms/Button"
import Icon from "./atoms/Icon"
import { MenuBar, MenuItem, SubMenu } from "./molecules/MenuBar"

import {
  getGMMapIndexes,
  getGMMapProgramNumber
} from "../midi/GM.js"

import "./Resizer.css"

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
      quantize: SharedService.quantizer.denominator,
      showLeftPane: true,
      showRightPane: true,
      showEventList: false,
      showPianoRoll: true
    }
  }

  get selectedTrack() {
    return this.props.song && this.props.song.selectedTrack
  }

  render() {
    const { props, state } = this
    const { song } = props
    const { selectedTrack, selectedTrackId } = song
    const { player, quantizer } = SharedService

    const updateNotes = (changes) => {
      selectedTrack.transaction(it => {
        changes.forEach(c => it.updateEvent(c.id, c))
      })
    }

    const onChangeFile = (e) => {
      const file = e.target.files[0]
      if (!file || (file.type != "audio/mid" && file.type != "audio/midi")) {
        return
      }
      props.onChangeFile(file)
    }

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
        pianoRollMouseMode: state.pianoRollMouseMode == 0 ? 1 : 0
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

    const onSelectQuantize = (value) => {
      quantizer.denominator = value
      this.setState({
        quantize: value
      })
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

    const onClickAutoScroll = () => {
      this.setState({
        pianoRollAutoScroll: !state.pianoRollAutoScroll
      })
    }

    const onChangeTrackName = (e) => {
      selectedTrack.setName(e.target.value)
    }

    const onChangeTrackVolume = (e) => {
      const track = selectedTrack
      const events = track.findVolumeEvents()
      if (events.length == 0) {
        return
      }
      track.updateEvent(events[0].id, {
        value: e.target.value
      })
    }

    const onChangeTrackPan = (e) => {
      const track = selectedTrack
      const events = track.findPanEvents()
      if (events.length == 0) {
        return
      }
      track.updateEvent(events[0].id, {
        value: e.target.value
      })
    }

    const onClickTrackInstrument = () => {
      const popup = new PopupComponent()
      popup.show()
      const track = selectedTrack
      const events = track.findProgramChangeEvents()
      if (events.length == 0) {
        return
      }

      const programNumber = events[0].value
      const ids = getGMMapIndexes(programNumber)

      ReactDOM.render(<InstrumentBrowser
        selectedCategoryId={ids[0]}
        selectedInstrumentId={ids[1]}

        onClickCancel={() => {
          popup.close()
        }}

        onClickOK={(e) => {
          const programNumber = getGMMapProgramNumber(e.categoryId, e.instrumentId)
          track.updateEvent(events[0].id, {
            value: programNumber
          })
          popup.close()
        }}
      />, popup.getContentElement())
    }

    const onClickAddTrack = () => {
      song.addTrack(Track.emptyTrack())
    }

    const onClickMute = (trackId) => {
      const channel = song.getTrack(trackId).channel
      const muted = player.isChannelMuted(channel)
      player.muteChannel(channel, !muted)
    }

    const onClickSolo = (trackId) => {
      const channel = song.getTrack(trackId).channel
      song.tracks.forEach((t, i) => {
        player.muteChannel(t.channel, i != channel)
      })
    }

    const onClickShowLeftPane = () => {
      this.setState({
        showLeftPane: !state.showLeftPane
      })
    }

    const onClickShowRightPane = () => {
      this.setState({
        showRightPane: !state.showRightPane
      })
    }

    const onClickShowPianoRoll = () => {
      this.setState({
        showPianoRoll: !state.showPianoRoll
      })
    }

    const changeTrack = (id) => {
      song.selectTrack(id)
    }

    const toolbar = <Toolbar
      song={props.song}
      quantize={state.quantize}
      mouseMode={state.pianoRollMouseMode}
      autoScroll={state.pianoRollAutoScroll}
      selectedTrackId={selectedTrackId}
      showLeftPane={state.showLeftPane}
      showRightPane={state.showRightPane}
      showPianoRoll={state.showPianoRoll}
      onChangeFile={onChangeFile}
      onClickPencil={onClickPencil}
      onClickSelection={onClickSelection}
      onClickScaleUp={onClickScaleUp}
      onClickScaleDown={onClickScaleDown}
      onSelectQuantize={onSelectQuantize}
      onClickPlay={onClickPlay}
      onClickStop={onClickStop}
      onClickBackward={onClickBackward}
      onClickForward={onClickForward}
      onClickAutoScroll={onClickAutoScroll}
      onClickShowLeftPane={onClickShowLeftPane}
      onClickShowRightPane={onClickShowRightPane}
      onClickShowPianoRoll={onClickShowPianoRoll}
    />

    const pianoRoll = <PianoRoll
      track={selectedTrack}
      quantizer={quantizer}
      player={player}
      endTick={props.song.endOfSong}
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

    const leftHeader =
      <div className="left-header">
        <label className="file">
          <Icon>file</Icon>
          <span className="song-name">{song && song.name}</span>
          <input type="file" accept=".mid,.midi" onChange={onChangeFile} />
        </label>
        <Button onClick={props.onSaveFile}><span className="icon">&#xe63c;</span></Button>
      </div>

    const menuBar =
      <MenuBar>
        <MenuItem title="File">
          <SubMenu>
            <MenuItem title="Open" />
            <MenuItem title="Save" />
          </SubMenu>
        </MenuItem>
        <MenuItem title="Edit">
          <SubMenu>
            <MenuItem title="Undo" />
            <MenuItem title="Redo" />
          </SubMenu>
        </MenuItem>
      </MenuBar>

    return <div id="vertical">
      <div className="flow-v">
        <Pane split="vertical" minSize={200} maxSize={300}>
          <div className="flow-v">
            {leftHeader}
            <TrackList
              tracks={song && song.tracks || []}
              selectedTrackId={selectedTrackId}
              onSelectTrack={changeTrack}
              onClickAddTrack={onClickAddTrack}
              onClickMute={onClickMute}
              onClickSolo={onClickSolo}
            />
            <div className="left-footer">

            </div>
          </div>
          <div className="flow-v">
            {menuBar}
            <Pane split="vertical" minSize="70%">
              <div className="flow-v">
                <TrackInfo
                  track={selectedTrack}
                  onChangeName={onChangeTrackName}
                  onChangeVolume={onChangeTrackVolume}
                  onChangePan={onChangeTrackPan}
                  onClickInstrument={onClickTrackInstrument}
                />
                {state.showPianoRoll ? pianoRoll : <ArrangeView
                  tracks={props.song && props.song.tracks || []}
                 />}
              </div>
              <PropertyPane
                notes={state.selectedEvents || []}
                updateNotes={updateNotes}
              />
            </Pane>
            {toolbar}
          </div>
        </Pane>
      </div>
    </div>
  }
}
