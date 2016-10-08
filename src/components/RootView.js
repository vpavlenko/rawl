import ReactDOM from "react-dom"
import React, { Component } from "react"
import observable from "riot-observable"

import SharedService from "../services/SharedService"
import Track from "../model/Track"
import PopupComponent from "./PopupComponent"
import Config from "../Config"

import TrackList from "./TrackList"
import TrackInfo from "./TrackInfo"
import Toolbar from "./Toolbar"
import EventList from "./EventList"
import InstrumentBrowser from "./InstrumentBrowser"
import PropertyPane from "./PropertyPane"
import PianoRoll from "./PianoRoll"
import ArrangeView from "./ArrangeView"

import {
  getGMMapIndexes,
  getGMMapProgramNumber
} from "../midi/GM.js"

export default class RootView extends Component {
  constructor(props) {
    super(props)

    this.state = {
      selectedTrackId: 0,
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

    {
      const emitter = {}
      observable(emitter)

      // FIXME
      emitter.on("select-notes", events => {
        this.setState({ selectedEvents: events })
      })

      this.pianoRollEmitter = emitter
    }
  }

  changeTrack(trackId) {
    this.setState({
      selectedTrackId: trackId
    })
  }

  onChangeFile(e) {
    const file = e.target.files[0]
    if (!file || (file.type != "audio/mid" && file.type != "audio/midi")) {
      return
    }
    this.props.onChangeFile(file)
  }

  onClickSave() {
    this.props.onSaveFile()
  }

  onClickPencil() {
    this.setState({pianoRollMouseMode: 0})
  }

  onClickSelection() {
    this.setState({pianoRollMouseMode: 1})
  }

  onChangeTool() {
    this.setState({
      pianoRollMouseMode: this.state.pianoRollMouseMode == 0 ? 1 : 0
    })
  }

  onClickScaleUp() {
    this.setState({
      pianoRollScaleX: this.state.pianoRollScaleX + 0.1
    })
  }

  onClickScaleDown() {
    this.setState({
      pianoRollScaleX: Math.max(0.05, this.state.pianoRollScaleX - 0.1),
    })
  }

  onChangeTrack(value) {
    this.changeTrack(value)
  }

  onSelectQuantize(value) {
    SharedService.quantizer.denominator = value
    this.setState({
      quantize: value
    })
  }

  onClickPlay() {
    SharedService.player.play()
  }

  onClickStop() {
    if (SharedService.player.isPlaying) {
      SharedService.player.stop()
    } else {
      SharedService.player.stop()
      SharedService.player.position = 0
    }
  }

  onClickBackward() {
    SharedService.player.position -= Config.TIME_BASE * 4
  }

  onClickForward() {
    SharedService.player.position += Config.TIME_BASE * 4
  }

  onClickAutoScroll() {
    this.setState({
      pianoRollAutoScroll: !this.state.pianoRollAutoScroll
    })
  }

  get selectedTrack() {
    return this.props.song && this.props.song.getTrack(this.state.selectedTrackId)
  }

  onChangeTrackName(e) {
    const track = this.selectedTrack
    track.setName(e.target.value)
  }

  onChangeTrackVolume(e) {
    const track = this.selectedTrack
    const events = track.findVolumeEvents()
    if (events.length == 0) {
      return
    }
    track.updateEvent(events[0].id, {
      value: e.target.value
    })
  }

  onChangeTrackPan(e) {
    const track = this.selectedTrack
    const events = track.findPanEvents()
    if (events.length == 0) {
      return
    }
    track.updateEvent(events[0].id, {
      value: e.target.value
    })
  }

  onClickTrackInstrument() {
    const popup = new PopupComponent()
    popup.show()
    const track = this.selectedTrack
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

  onSelectTrack(trackId) {
    this.changeTrack(trackId)
  }

  onClickAddTrack() {
    this.props.song.addTrack(Track.emptyTrack())
  }

  onClickMute(trackId) {
    const channel = this.props.song.getTrack(trackId).channel
    const muted = SharedService.player.isChannelMuted(channel)
    SharedService.player.muteChannel(channel, !muted)
  }

  onClickSolo(trackId) {
    const channel = this.props.song.getTrack(trackId).channel
    this.props.song.getTracks().forEach((t, i) => {
      SharedService.player.muteChannel(t.channel, i != channel)
    })
  }

  onClickShowLeftPane() {
    this.setState({
      showLeftPane: !this.state.showLeftPane
    })
  }

  onClickShowRightPane() {
    this.setState({
      showRightPane: !this.state.showRightPane
    })
  }

  onClickShowPianoRoll() {
    this.setState({
      showPianoRoll: !this.state.showPianoRoll
    })
  }

  updateNotes(changes) {
    this.selectedTrack.transaction(it => {
      changes.forEach(c => it.updateEvent(c.id, c))
    })
  }

  render() {
    return <div id="vertical">
      <Toolbar ref={c => this.toolbar = c}
        song={this.props.song}
        quantize={this.state.quantize}
        mouseMode={this.state.pianoRollMouseMode}
        autoScroll={this.state.pianoRollAutoScroll}
        selectedTrackId={this.state.selectedTrackId}
        showLeftPane={this.state.showLeftPane}
        showRightPane={this.state.showRightPane}
        showPianoRoll={this.state.showPianoRoll}
        onChangeFile={this.onChangeFile.bind(this)}
        onClickSave={this.onClickSave.bind(this)}
        onClickPencil={this.onClickPencil.bind(this)}
        onClickSelection={this.onClickSelection.bind(this)}
        onClickScaleUp={this.onClickScaleUp.bind(this)}
        onClickScaleDown={this.onClickScaleDown.bind(this)}
        onSelectQuantize={this.onSelectQuantize.bind(this)}
        onClickPlay={this.onClickPlay.bind(this)}
        onClickStop={this.onClickStop.bind(this)}
        onClickBackward={this.onClickBackward.bind(this)}
        onClickForward={this.onClickForward.bind(this)}
        onClickAutoScroll={this.onClickAutoScroll.bind(this)}
        onClickShowLeftPane={this.onClickShowLeftPane.bind(this)}
        onClickShowRightPane={this.onClickShowRightPane.bind(this)}
        onClickShowPianoRoll={this.onClickShowPianoRoll.bind(this)}
      />
      <div id="container">
        {this.state.showLeftPane &&
          <TrackList ref={c => this.trackList = c}
            tracks={this.props.song && this.props.song.getTracks() || []}
            selectedTrackId={this.state.selectedTrackId}
            onSelectTrack={this.onSelectTrack.bind(this)}
            onClickAddTrack={this.onClickAddTrack.bind(this)}
            onClickMute={this.onClickMute.bind(this)}
            onClickSolo={this.onClickSolo.bind(this)}
          />
        }
        {this.state.showEventList &&
          <EventList ref={c => this.eventList = c}
            track={this.selectedTrack} />
        }
        <div id="side">
          <TrackInfo ref={c => this.trackInfo = c}
            track={this.selectedTrack}
            onChangeName={this.onChangeTrackName.bind(this)}
            onChangeVolume={this.onChangeTrackVolume.bind(this)}
            onChangePan={this.onChangeTrackPan.bind(this)}
            onClickInstrument={this.onClickTrackInstrument.bind(this)}
          />
        </div>
        {this.state.showPianoRoll ?
          <PianoRoll
            emitter={this.pianoRollEmitter}
            track={this.selectedTrack}
            endTick={this.props.song.getEndOfSong()}
            scaleX={this.state.pianoRollScaleX}
            scaleY={this.state.pianoRollScaleY}
            autoScroll={this.state.pianoRollAutoScroll}
            onChangeTool={this.onChangeTool.bind(this)}
            mouseMode={this.state.pianoRollMouseMode} />
          : <ArrangeView
            tracks={this.props.song && this.props.song.getTracks() || []}
           />
        }
        {this.state.showRightPane &&
          <PropertyPane ref={c => this.propertyPane = c}
            notes={this.state.selectedEvents || []}
            updateNotes={this.updateNotes.bind(this)}
          />
        }
      </div>
    </div>
  }
}
