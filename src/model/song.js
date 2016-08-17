import _ from "lodash"
import MeasureList from "./measure-list"
import Track from "./track"
import { 
  TrackNameMidiEvent, EndOfTrackMidiEvent,
  TimeSignatureMidiEvent, SetTempoMidiEvent } from "../../vendor/jasmid/midievent"
import observable from "riot-observable"

export default class Song {
  constructor() {
    this.tracks = []
    this.name = "Untitled Song"
    observable(this)
  }

  addTrack(t) {
    t.channel = t.channel || this.tracks.length
    t.on("change", () => this.trigger("change"))
    this.tracks.push(t)
    this.trigger("add-track", t)
    this.trigger("change")
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
    
    // conductor track
    {
      const track = new Track()
      track.addEvent(new TrackNameMidiEvent(0, "Conductor Track"))
      track.addEvent(new TimeSignatureMidiEvent(0, 4, 4, 24))
      track.addEvent(new SetTempoMidiEvent(0, 120))
      track.addEvent(new EndOfTrackMidiEvent(0))
      song.addTrack(track)
    }

    {
      const track = new Track()
      track.addEvent(new TrackNameMidiEvent(0, ""))
      track.addEvent(new EndOfTrackMidiEvent(1200))
      song.addTrack(track)
    }

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
