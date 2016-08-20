import SharedService from "../shared-service"
import Track from "../model/track"
import PopupComponent from "../view/popup-component"
import Config from "../config"

import TrackList from "./track-list"
import TrackInfo from "./track-info"
import Toolbar from "./toolbar"
import EventList from "./event-list"
import InstrumentBrowser from "./instrument-browser"
import PropertyPane from "./property-pane"
import PianoRoll from "./piano-roll"

import React, { Component } from "react"
import ReactDOM from "react-dom"
import observable from "riot-observable"

import {
  getGMMapIndexes,
  getGMMapProgramNumber
} from "../gm.js"

class RootComponent extends Component {
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
      showRightPane: true
    }

    {
      const emitter = {}
      observable(emitter)

      emitter.on("select-notes", events => {
        this.setState({ selectedEvents: events })
      })

      emitter.on("move-cursor", tick => {
        const t = SharedService.quantizer.round(tick)
        SharedService.player.seek(t)
      })

      emitter.on("change-tool", () => {
        this.setState({
          pianoRollMouseMode: this.state.pianoRollMouseMode == 0 ? 1 : 0 
        })
      })

      this.pianoRollEmitter = emitter
    }
  }

  emit(name, obj) {
    this.props.emitter.trigger(name, obj)
  }

  componentDidMount() {
    setTimeout(() => this.emit("did-mount", this), 0)
  }

  setSong(song) {
    this.setState({ song: song })

    song.on("change", () => {
      this.setState({ song: song })
    })
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
    this.emit("change-file", file)
  }

  onClickSave() {
    this.emit("save-file")
  }

  onClickPencil() {
    this.setState({pianoRollMouseMode: 0})
  }

  onClickSelection() {
    this.setState({pianoRollMouseMode: 1})
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
    SharedService.player.prepare(this.state.song)
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
    return this.state.song && this.state.song.getTrack(this.state.selectedTrackId)
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
    this.state.song.addTrack(Track.emptyTrack())
  }

  onClickMute(trackId) {
    const channel = this.state.song.getTrack(trackId).channel
    const muted = SharedService.player.isChannelMuted(channel)
    SharedService.player.muteChannel(channel, !muted)
  }

  onClickSolo(trackId) {
    const channel = this.state.song.getTrack(trackId).channel
    this.state.song.getTracks().forEach((t, i) => {
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

  updateNotes(changes) {
    this.selectedTrack.transaction(it => {
      changes.forEach(c => it.updateEvent(c.id, c))
    })
  }

  render() {
    return <div id="vertical">
      <Toolbar ref={c => this.toolbar = c}
        song={this.state.song}
        quantize={this.state.quantize}
        mouseMode={this.state.pianoRollMouseMode}
        autoScroll={this.state.pianoRollAutoScroll}
        selectedTrackId={this.state.selectedTrackId}
        showLeftPane={this.state.showLeftPane}
        showRightPane={this.state.showRightPane}
        onChangeFile={this.onChangeFile.bind(this)}
        onClickSave={this.onClickSave.bind(this)}
        onClickPencil={this.onClickPencil.bind(this)}
        onClickSelection={this.onClickSelection.bind(this)}
        onClickScaleUp={this.onClickScaleUp.bind(this)}
        onClickScaleDown={this.onClickScaleDown.bind(this)}
        onSelectTrack={this.onChangeTrack.bind(this)}
        onSelectQuantize={this.onSelectQuantize.bind(this)}
        onClickPlay={this.onClickPlay.bind(this)}
        onClickStop={this.onClickStop.bind(this)}
        onClickBackward={this.onClickBackward.bind(this)}
        onClickForward={this.onClickForward.bind(this)}
        onClickAutoScroll={this.onClickAutoScroll.bind(this)}
        onClickShowLeftPane={this.onClickShowLeftPane.bind(this)}
        onClickShowRightPane={this.onClickShowRightPane.bind(this)}
      />
      <div id="container">
        {this.state.showLeftPane && 
          <TrackList ref={c => this.trackList = c}
            tracks={this.state.song && this.state.song.getTracks() || []}
            selectedTrackId={this.state.selectedTrackId}
            onSelectTrack={this.onSelectTrack.bind(this)}
            onClickAddTrack={this.onClickAddTrack.bind(this)}
            onClickMute={this.onClickMute.bind(this)}
            onClickSolo={this.onClickSolo.bind(this)}
          />
        }
        <div id="side">
          <TrackInfo ref={c => this.trackInfo = c}
            track={this.selectedTrack}
            onChangeName={this.onChangeTrackName.bind(this)}
            onChangeVolume={this.onChangeTrackVolume.bind(this)}
            onChangePan={this.onChangeTrackPan.bind(this)}
            onClickInstrument={this.onClickTrackInstrument.bind(this)}
          />
          <EventList ref={c => this.eventList = c}
            track={this.selectedTrack} />
        </div>
        <PianoRoll
          emitter={this.pianoRollEmitter}
          track={this.selectedTrack}
          scaleX={this.state.pianoRollScaleX}
          scaleY={this.state.pianoRollScaleY}
          autoScroll={this.state.pianoRollAutoScroll}
          mouseMode={this.state.pianoRollMouseMode} />
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

export default class RootView {
  constructor() {
    this.emitter = {}
    observable(this.emitter)

    this.trackId = 0

    this.emitter.on("did-mount", rootComponent => {
      this.component = rootComponent
      this.emitter.trigger("view-did-load")
    })

    setTimeout(() => {
      this.loadView()
    }, 0)
  }

  setSong(song) {
    this.component.setSong(song)
  }

  loadView() {
    ReactDOM.render(<RootComponent 
      emitter={this.emitter} />, document.querySelector("#root"))
  }
}
