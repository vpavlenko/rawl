import PianoRollController from "../controller/piano-roll-controller"
import SharedService from "../shared-service"
import Track from "../model/track"
import PopupComponent from "../view/popup-component"
import Config from "../config"

import "../tag/event-list.tag"
import "../tag/riot-select.tag"
import "../tag/context-menu.tag"
import "../tag/property-pane.tag"
import "../tag/instrument-browser.tag"

import TrackList from "./track-list"
import TrackInfo from "./track-info"
import Toolbar from "./toolbar"

import React, { Component } from "react"
import ReactDOM from "react-dom"

import {
  getInstrumentName,
  getGMMapIndexes,
  getGMMapProgramNumber
} from "../gm.js"

export default class RootView {
  constructor() {
    this.emitter = {}
    this.trackId = 0
    riot.observable(this.emitter)
    setTimeout(() => {
      this.loadView()
    }, 0)
 }

  setSong(song) {
    this.song = song
    this.toolbar.setState({song: song})
    this.trackList.setState({tracks: song.getTracks()})
    this.pianoRoll.track = song.getTrack(0)
    song.on("add-track", () => {
      this.trackList.setState({tracks: song.getTracks()})
    })
  }

  loadView() {
    this.propertyPane = riot.mount("property-pane")[0]
    this.eventList = riot.mount("event-list")[0]
    this.pianoRoll = new PianoRollController(document.querySelector("#piano-roll"))

    ReactDOM.render(<TrackInfo ref={c => this.trackInfo = c}
      onChangeName={e => {
        const track = this.song.getTrack(this.trackId)
        track.setName(e.target.value)
        this.trackInfo.setState({track: track})
      }}

      onChangeVolume={e => {
        const track = this.song.getTrack(this.trackId)
        const events = track.findVolumeEvents()
        if (events.length == 0) {
          return
        }
        track.updateEvent(events[0].id, {
          value: e.target.value
        })
        this.trackInfo.setState({track: track})
      }}

      onChangePan={e => {
        const track = this.song.getTrack(this.trackId)
        const events = track.findPanEvents()
        if (events.length == 0) {
          return
        }
        track.updateEvent(events[0].id, {
          value: e.target.value
        })
        this.trackInfo.setState({track: track})
      }}

      onClickInstrument={e => {
        const popup = new PopupComponent()
        const track = this.song.getTrack(this.trackId)
        const events = track.findProgramChangeEvents()
        if (events.length == 0) {
          return
        }

        const programNumber = events[0].value
        const ids = getGMMapIndexes(programNumber)
        riot.mount(popup.getContentElement(), "instrument-browser", {
          selectedCategoryId: ids[0],
          selectedInstrumentId: ids[1],
          onClickCancel: () => {
            popup.close()
          },
          onClickOK: e => {
            const programNumber = getGMMapProgramNumber(e.categoryId, e.instrumentId)
            track.updateEvent(events[0].id, {
              value: programNumber
            })
            this.trackInfo.setState({track: track})
            popup.close()
          }
        })
        popup.show()
      }}

    />, document.querySelector("track-info"))

    ReactDOM.render(<Toolbar ref={c => this.toolbar = c}
      onChangeFile={e => {
        const file = e.target.files[0]
        if (!file || (file.type != "audio/mid" && file.type != "audio/midi")) {
          return
        }
        this.emitter.trigger("change-file", file)
      }}

      onClickSave={e => {
        this.emitter.trigger("save-file")
      }}

      onClickPencil={e => {
        this.pianoRoll.mouseMode = 0
      }}

      onClickSelection={e => {
        this.pianoRoll.mouseMode = 1
      }}

      onClickScaleUp={e => {
        this.pianoRoll.noteScale = {
          x: this.pianoRoll.noteScale.x + 0.1,
          y: this.pianoRoll.noteScale.y,
        }
      }}

      onClickScaleDown={e => {
        this.pianoRoll.noteScale = {
          x: Math.max(0.05, this.pianoRoll.noteScale.x - 0.1),
          y: this.pianoRoll.noteScale.y,
        }
      }}

      onSelectTrack={e => {
        this.changeTrack(e.target.value)
      }}

      onSelectQuantize={e => {
        SharedService.quantizer.denominator = e.target.value
      }}

      onClickPlay={e => {
        SharedService.player.prepare(this.song)
        SharedService.player.play()
      }}

      onClickStop={e => {
        if (SharedService.player.isPlaying) {
          SharedService.player.stop()
        } else {
          SharedService.player.stop()
          SharedService.player.position = 0
        }
      }}

      onClickBackward={e => {
        SharedService.player.position -= Config.TIME_BASE * 4
      }}

      onClickForward={e => {
        SharedService.player.position += Config.TIME_BASE * 4
      }}

      onClickAutoScroll={e => {
        this.pianoRoll.autoScroll = !this.pianoRoll.autoScroll
      }}
    />, document.querySelector("toolbar"))

    ReactDOM.render(<TrackList ref={c => this.trackList = c}
      onSelectTrack={trackId => {
        this.changeTrack(trackId)
      }}

      onClickAddTrack={() => {
        this.song.addTrack(new Track)
      }}

      onClickMute={trackId => {
        const channel = this.song.getTrack(trackId).channel
        const muted = SharedService.player.isChannelMuted(channel)
        SharedService.player.muteChannel(channel, !muted)
      }}

      onClickSolo={trackId => {
        const channel = this.song.getTrack(trackId).channel
        this.song.getTracks().forEach((t, i) => {
          SharedService.player.muteChannel(t.channel, i != trackId)
        })
      }}
    />, document.querySelector("track-list"))

    this.viewDidLoad()
  }

  changeTrack(trackId) {
    this.trackId = trackId
    const track = this.song.getTrack(trackId)
    this.pianoRoll.track = track
    this.trackInfo.setState({track: track})
    this.trackList.setState({selectedTrackId: trackId})
    this.eventList.update({track: track})
  }

  viewDidLoad() {
    this.pianoRoll.emitter.on("select-notes", events => {
      this.propertyPane.update({notes: events})
    })

    this.pianoRoll.emitter.on("move-cursor", tick => {
        const t = SharedService.quantizer.round(tick)
        SharedService.player.seek(t)
    })

    this.propertyPane.emitter.on("update-note", e => {
      this.song.getTrack(this.trackId).updateEvent(e.id, e)
    })

    this.propertyPane.emitter.on("update-notes", changes => {
      this.song.getTrack(this.trackId).transaction(it => {
        changes.forEach(c => it.updateEvent(c.id, c))
      })
    })

    this.emitter.trigger("view-did-load")
  }
}
