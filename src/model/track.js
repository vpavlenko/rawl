import _ from "lodash"
import observable from "riot-observable"
import { 
  TrackNameMidiEvent, EndOfTrackMidiEvent,
  TimeSignatureMidiEvent, SetTempoMidiEvent,
  PitchBendMidiEvent, VolumeMidiEvent,
  PanMidiEvent, ExpressionMidiEvent,
  ModulationMidiEvent, ProgramChangeMidiEvent } from "../../vendor/jasmid/midievent"

export default class Track {
  constructor() {
    this.events = []
    this.lastEventId = 0
    observable(this)
  }

  setName(name) {
    const e = this.findTrackNameEvent()
    this.updateEvent(e.id, {
      value: name
    })
  }

  getName() {
    const e = this.findTrackNameEvent()
    return e && e.text || ""
  }

  getEvents() {
    return this.events
  }

  getEventById(id) {
    for (const e of this.events) {
      if (e.id == id) {
        return e
      }
    }
    return null
  }

  updateEvent(id, obj) {
    const anObj = this.getEventById(id)
    if (_.isEqual(Object.assign({}, anObj, obj), anObj)) {
      return
    }
    _.extend(anObj, obj)
    this.updateEndOfTrack()
    this.sortByTick()
    this.emitChange()
    return anObj
  }

  removeEvent(id) {
    const obj = this.getEventById(id)
    _.pull(this.events, obj)
    this.updateEndOfTrack()
    this.emitChange()
  }

  addEvent(e) {
    if (e.tick === undefined) {
      const lastEvent = this.getEventById(this.lastEventId)
      e.tick = e.deltaTime + (lastEvent ? lastEvent.tick : 0)
    }
    e.id = this.lastEventId
    if (e.type == "channel" && e.channel === undefined) {
      e.channel = this.channel
    }
    this.events.push(e)
    this.updateEndOfTrack()
    this.sortByTick()
    this.lastEventId++
    this.emitChange()
    return e
  }

  sortByTick() {
    this.events.sort((a, b) => a.tick - b.tick)
  }

  updateEndOfTrack() {
    const eot = this.findEndOfTrackEvent()
    if (eot) {
      eot.tick = _.chain(this.events)
        .map(e => e.tick + (e.duration || 0))
        .max()
        .value()
    }
  }

  transaction(func) {
    this._paused = true
    this._changed = false
    func(this)
    this._paused = false
    if (this._changed) {
      this.emitChange()
    }
  }

  emitChange() {
    this._changed = true
    if (!this._paused) { 
      this.trigger("change")
    }
  }

  /* helper */

  findTrackNameEvent() {
    return _.head(this.events.filter(t => t.subtype == "trackName"))
  }

  findProgramChangeEvents() {
    return this.events.filter(t => t.subtype == "programChange")
  }

  findEndOfTrackEvent() {
    return _.head(this.events.filter(t => t.subtype == "endOfTrack"))
  }

  findVolumeEvents() {
    return this.events.filter(t => t.subtype == "controller" && t.controllerType == 7)
  }

  findPanEvents() {
    return this.events.filter(t => t.subtype == "controller" && t.controllerType == 10)
  }

  static conductorTrack(name = "Conductor Track") {
    const track = new Track()
    const events = [
      new TrackNameMidiEvent(0, name),
      new TimeSignatureMidiEvent(0, 4, 4, 24),
      new SetTempoMidiEvent(0, 60000 / 120),
      new EndOfTrackMidiEvent(0)
    ]
    events.forEach(e => track.addEvent(e))
    return track
  }

  static emptyTrack(channel) {
    const track = new Track()
    track.channel = channel
    const events = [
      new TrackNameMidiEvent(0, ""),
      new PanMidiEvent(0, 64), 
      new VolumeMidiEvent(0, 100),
      new ExpressionMidiEvent(0, 127),
      new PitchBendMidiEvent(0, 0x2000),
      new ModulationMidiEvent(0, 0),
      new ProgramChangeMidiEvent(0, 0),
      new EndOfTrackMidiEvent(0)
    ]
    events.forEach(e => track.addEvent(e))
    return track
  }
}
