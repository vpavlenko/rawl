import _ from "lodash"
import MeasureList from "./measure-list"
import Track from "./track"
import observable from "riot-observable"

export default class Song {
  constructor() {
    this.tracks = []
    this.name = "Untitled Song"
    observable(this)
  }

  emitChange() {
    this.trigger("change")
  }

  addTrack(t) {
    t.channel = t.channel || this.tracks.length
    t.on("change", () => this.emitChange())
    this.tracks.push(t)
    this.trigger("add-track", t)
    this.emitChange()
  }

  getTracks() {
    return this.tracks
  }

  getTrack(id) {
    return this.tracks[id]
  }

  getMeasureList() {
    if (this.measureList) {
      return this.measureList
    } 

    this.measureList = new MeasureList(this.getTrack(0))
    return this.measureList
  }

  static emptySong() {
    const song = new Song()
    song.addTrack(Track.conductorTrack())
    song.addTrack(Track.emptyTrack(0))
    song.name = "new song.mid"
    return song
  }

  static fromMidi(midi) {
    const song = new Song
    midi.tracks.forEach(t => {
      const track = new Track
      t.events.forEach(e => {
        track.addEvent(e)
      })
      track.endOfTrack = t.end
      const chEvent = _.find(t.events, e => {
        return e.type == "channel"
      })
      track.channel = chEvent ? chEvent.channel : undefined
      song.addTrack(track)
    })
    return song
  }
}
