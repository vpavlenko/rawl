import { observable, autorun, computed, action } from "mobx"
import { json } from "json-mobx"
import _ from "lodash"

import Track from "./Track"
import MeasureList from "../model/MeasureList"

const END_MARGIN = 480 * 30

export default class Song {
  @json @observable.shallow tracks = json.arrayOf(Track)
  @json @observable selectedTrackId = 0
  @json @observable filepath = ""

  _updateEndOfSong() {
    this._endOfSong = _.max(this.tracks.map(t => t.endOfTrack)) + END_MARGIN
    this._measureList = null
  }

  disposer = null

  @action addTrack(t) {
    // 最初のトラックは Conductor Track なので channel を設定しない
    if (this.tracks.length > 0) {
      t.channel = t.channel || this.tracks.length - 1
    }
    this.tracks.push(t)
    this._updateEndOfSong()

    if (this.disposer) {
      this.disposer()
    }
    this.disposer = autorun(() => {
      this._updateEndOfSong()
    })
  }

  @action removeTrack(id) {
    _.pullAt(this.tracks, id)
    this.selectedTrackId = Math.min(id, this.tracks.length - 1)
    this._updateEndOfSong()
  }

  @action selectTrack(id) {
    if (id === this.selectedTrackId) { return }
    this.selectedTrackId = id
  }

  @computed get conductorTrack() {
    return _.find(this.tracks, t => t.isConductorTrack)
  }

  @computed get selectedTrack() {
    return this.tracks[this.selectedTrackId]
  }

  getTrack(id) {
    return this.tracks[id]
  }

  get measureList() {
    if (this._measureList) {
      return this._measureList
    }

    this._measureList = new MeasureList(this.conductorTrack, this.endOfSong)
    return this._measureList
  }

  get endOfSong() {
    return this._endOfSong
  }

  trackIdOfChannel(channel) {
    const tracks = this.tracks
    const track = _.find(tracks, t => t.channel === channel)
    if (track) {
      return tracks.indexOf(track)
    }
    return undefined
  }

  static emptySong() {
    const song = new Song()
    song.addTrack(Track.conductorTrack())
    song.addTrack(Track.emptyTrack(0))
    song.name = "new song"
    song.filepath = "new song.mid"
    song.selectedTrackId = 1
    return song
  }

  static fromMidi(midi) {
    const song = new Song()
    midi.tracks.forEach(t => {
      const track = new Track()

      const chEvent = _.find(t.events, e => {
        return e.type === "channel"
      })
      track.channel = chEvent ? chEvent.channel : undefined
      track.addEvents(t.events)

      song.addTrack(track)
    })
    song.selectedTrackId = 1
    return song
  }
}
