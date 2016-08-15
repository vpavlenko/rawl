import PianoRollController from "../controller/piano-roll-controller"
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

import React, { Component } from "react"
import ReactDOM from "react-dom"
import observable from "riot-observable"

import {
  getGMMapIndexes,
  getGMMapProgramNumber
} from "../gm.js"

class RootComponent extends Component {
  emit(name, obj) {
    this.props.emitter.trigger(name, obj)
  }

  componentDidMount() {
    this.pianoRoll = new PianoRollController(this.pianoRollCanvas)

    this.pianoRoll.emitter.on("select-notes", events => {
      this.propertyPane.setState({notes: events})
    })

    this.pianoRoll.emitter.on("move-cursor", tick => {
      const t = SharedService.quantizer.round(tick)
      SharedService.player.seek(t)
    })

    this.emit("did-mount", this)
  }

  setSong(song) {
    this.setState({
      song: song
    })
    this.toolbar.setState({song: song})
    this.trackList.setState({tracks: song.getTracks()})
    this.pianoRoll.track = song.getTrack(0)
    song.on("add-track", () => {
      this.trackList.setState({tracks: song.getTracks()})
    })
  }

  changeTrack(trackId) {
    this.trackId = trackId
    const track = this.state.song.getTrack(trackId)
    this.pianoRoll.track = track
    this.trackInfo.setState({track: track})
    this.trackList.setState({selectedTrackId: trackId})
    this.eventList.setState({track: track})
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
    this.pianoRoll.mouseMode = 0
  }

  onClickSelection() {
    this.pianoRoll.mouseMode = 1
  }

  onClickScaleUp() {
    this.pianoRoll.noteScale = {
      x: this.pianoRoll.noteScale.x + 0.1,
      y: this.pianoRoll.noteScale.y,
    }
  }

  onClickScaleDown() {
    this.pianoRoll.noteScale = {
      x: Math.max(0.05, this.pianoRoll.noteScale.x - 0.1),
      y: this.pianoRoll.noteScale.y,
    }
  }

  onSelectTrack(e) {
    this.changeTrack(e.target.value)
  }

  onSelectQuantize(e) {
    SharedService.quantizer.denominator = e.target.value
  }

  onClickPlay() {
    SharedService.player.prepare(this.song)
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
    this.pianoRoll.autoScroll = !this.pianoRoll.autoScroll
  }

  onChangeName(e) {
    const track = this.song.getTrack(this.trackId)
    track.setName(e.target.value)
    this.trackInfo.setState({track: track})
  }

  onChangeVolume(e) {
    const track = this.song.getTrack(this.trackId)
    const events = track.findVolumeEvents()
    if (events.length == 0) {
      return
    }
    track.updateEvent(events[0].id, {
      value: e.target.value
    })
    this.trackInfo.setState({track: track})
  }

  onChangePan(e) {
    const track = this.song.getTrack(this.trackId)
    const events = track.findPanEvents()
    if (events.length == 0) {
      return
    }
    track.updateEvent(events[0].id, {
      value: e.target.value
    })
    this.trackInfo.setState({track: track})
  }

  onClickInstrument() {
    const popup = new PopupComponent()
    popup.show()
    const track = this.song.getTrack(this.trackId)
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
        this.trackInfo.setState({track: track})
        popup.close()
      }}
    />, popup.getContentElement())
  }

  onChangeTrack(trackId) {
    this.changeTrack(trackId)
  }

  onClickAddTrack() {
    this.song.addTrack(new Track)
  }

  onClickMute(trackId) {
    const channel = this.song.getTrack(trackId).channel
    const muted = SharedService.player.isChannelMuted(channel)
    SharedService.player.muteChannel(channel, !muted)
  }

  onClickSolo(trackId) {
    const channel = this.song.getTrack(trackId).channel
    this.song.getTracks().forEach((t, i) => {
      SharedService.player.muteChannel(t.channel, i != channel)
    })
  }

  updateNotes(changes) {
    this.song.getTrack(this.trackId).transaction(it => {
      changes.forEach(c => it.updateEvent(c.id, c))
    })
  }

  render() {
    return <div id="vertical">
      <Toolbar ref={c => this.toolbar = c}
        onChangeFile={this.onChangeFile.bind(this)}
        onClickSave={this.onClickSave.bind(this)}
        onClickPencil={this.onClickPencil}
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
      />
      <div id="container">
        <TrackList ref={c => this.trackList = c}
          onSelectTrack={this.onSelectTrack.bind(this)}
          onClickAddTrack={this.onClickAddTrack.bind(this)}
          onClickMute={this.onClickMute.bind(this)}
          onClickSolo={this.onClickSolo.bind(this)}
        />
        <div id="side">
          <TrackInfo ref={c => this.trackInfo = c}
            onChangeName={this.onChangeName.bind(this)}
            onChangeVolume={this.onChangeVolume.bind(this)}
            onChangePan={this.onChangePan.bind(this)}
            onClickInstrument={this.onClickInstrument.bind(this)}
          />
          <EventList ref={c => this.eventList = c} />
        </div>
        <div id="piano-roll-container">
          <canvas id="piano-roll" ref={c => this.pianoRollCanvas = c} onContextMenu={() => false}></canvas>
        </div>
        <PropertyPane ref={c => this.propertyPane = c} 
          updateNotes={this.updateNotes.bind(this)}
        />
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
