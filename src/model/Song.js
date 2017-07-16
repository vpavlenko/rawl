import _ from "lodash"
import observable from "riot-observable"
import MeasureList from "./MeasureList"
import Track from "./Track"
import maxX from "../helpers/maxX"

export default class Song {
  _tracks = []
  name = "Untitled Song"
  _selectedTrackId = 0
  _measureList = null
  
  constructor() {
    observable(this)
  }

  _emitChange() {
    this.trigger("change")
  }

  addTrack(t) {
    // 最初のトラックは Conductor Track なので channel を設定しない
    if (this._tracks.length > 0) {
      t.channel = t.channel || this._tracks.length - 1
    }
    t.on("change", () => this._emitChange())
    this._tracks.push(t)
    this.trigger("add-track", t)
    this._emitChange()
  }

  removeTrack(id) {
    _.pullAt(this._tracks, id)
    this._selectedTrackId = Math.min(id, this._tracks.length)
    this._emitChange()
  }

  selectTrack(id) {
    if (id === this.selectedTrackId) { return }
    this._selectedTrackId = id
    this._emitChange()
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

    this._measureList = new MeasureList(this.getTrack(0))
    return this._measureList
  }

  get endOfSong() {
    return maxX(_.flatten(this._tracks.map(t => t.getEvents())))
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

      t.events.forEach(e => {
        track.addEvent(e)
      })

      song.addTrack(track)
    })
    return song
  }
}
