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

    const onClickPencil = () => {
      this.setState({pianoRollMouseMode: 0})
    }

    const onClickSelection = () => {
      this.setState({pianoRollMouseMode: 1})
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

    return <div id="vertical">
      <Toolbar
        song={props.song}
        quantize={state.quantize}
        mouseMode={state.pianoRollMouseMode}
        autoScroll={state.pianoRollAutoScroll}
        selectedTrackId={selectedTrackId}
        showLeftPane={state.showLeftPane}
        showRightPane={state.showRightPane}
        showPianoRoll={state.showPianoRoll}
        onChangeFile={onChangeFile}
        onClickSave={props.onSaveFile}
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
      <div id="container">
        {state.showLeftPane &&
          <TrackList
            tracks={song && song.tracks || []}
            selectedTrackId={selectedTrackId}
            onSelectTrack={changeTrack}
            onClickAddTrack={onClickAddTrack}
            onClickMute={onClickMute}
            onClickSolo={onClickSolo}
          />
        }
        {state.showEventList &&
          <EventList
            track={selectedTrack} />
        }
        <div id="detail">
          <TrackInfo
            track={selectedTrack}
            onChangeName={onChangeTrackName}
            onChangeVolume={onChangeTrackVolume}
            onChangePan={onChangeTrackPan}
            onClickInstrument={onClickTrackInstrument}
          />
          {state.showPianoRoll ?
            <PianoRoll
              track={selectedTrack}
              endTick={props.song.endOfSong}
              scaleX={state.pianoRollScaleX}
              scaleY={state.pianoRollScaleY}
              autoScroll={state.pianoRollAutoScroll}
              onChangeTool={onChangeTool}
              mouseMode={state.pianoRollMouseMode} />
            : <ArrangeView
              tracks={props.song && props.song.tracks || []}
             />
          }
        </div>
        {state.showRightPane &&
          <PropertyPane
            notes={state.selectedEvents || []}
            updateNotes={updateNotes}
          />
        }
      </div>
    </div>
  }
}
