import _ from "lodash"
import EventEmitter from "eventemitter3"
import MeasureList from "./MeasureList"
import Track from "./Track"
import maxX from "../helpers/maxX"

export default class Song extends EventEmitter {
  _tracks = []
  name = "Untitled Song"
  _selectedTrackId = 0
  _measureList = null
  _endOfSong = 0

  _emitChange() {
    this.emit("change")
  }

  _updateEndOfSong() {
    this._endOfSong = maxX(_.flatten(this._tracks.map(t => t.getEvents())))
  }

  clone() {
    const newSong = _.cloneDeep(this)
    newSong.observeTracks()
    return newSong
  }

  observeTracks() {
    // track の監視状態がなくなっているのを復帰する
    for (let t of this._tracks) {
      t.on("change", () => {
        this._emitChange()
        this._updateEndOfSong()
      })
    }
  }

  addTrack(t) {
    // 最初のトラックは Conductor Track なので channel を設定しない
    if (this._tracks.length > 0) {
      t.channel = t.channel || this._tracks.length - 1
    }
    t.on("change", () => {
      this._emitChange()
      this._updateEndOfSong()
    })
    this._tracks.push(t)
    this.emit("add-track", t)
    this._emitChange()
    this._updateEndOfSong()
  }

  removeTrack(id) {
    _.pullAt(this._tracks, id)
    this._selectedTrackId = Math.min(id, this._tracks.length - 1)
    this._emitChange()
    this._updateEndOfSong()
  }

  selectTrack(id) {
    if (id === this.selectedTrackId) { return }
    this._selectedTrackId = id
    this._emitChange()
  }

  get conductorTrack() {
    return _.find(this._tracks, t => t.isConductorTrack)
  }

  get selectedTrack() {
    return this._tracks[this._selectedTrackId]
  }

  get selectedTrackId() {
    return this._selectedTrackId
  }

  get tracks() {
    return this._tracks
  }

  getTrack(id) {
    return this._tracks[id]
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
    const tracks = this._tracks
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
    song.name = "new song.mid"
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
    return song
  }
}
