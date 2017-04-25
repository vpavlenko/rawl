import _ from "lodash"
import observable from "riot-observable"
import {
  TrackNameMidiEvent, EndOfTrackMidiEvent,
  TimeSignatureMidiEvent, SetTempoMidiEvent,
  PitchBendMidiEvent, VolumeMidiEvent,
  PanMidiEvent, ExpressionMidiEvent,
  ModulationMidiEvent, ProgramChangeMidiEvent } from "../midi/midievent"
import { getInstrumentName } from "../midi/GM"

function lastValue(arr, prop) {
  const last = _.last(arr)
  return last && last[prop]
}

export default class Track {
  constructor() {
    this.events = []
    this.lastEventId = 0
    observable(this)
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
    const newObj = Object.assign({}, anObj, obj)
    if (_.isEqual(newObj, anObj)) {
      return
    }
    this.replaceEventById(id, newObj)
    this.updateEndOfTrack()
    this.sortByTick()
    this.emitChange()
    return newObj
  }

  replaceEventById(id, event) {
    for (let i = 0; i < this.events.length; i++) {
      if (this.events[i].id === id) {
        this.events[i] = event
        break
      }
    }
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
    if (e.type == "channel") {
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
    this.endOfTrack = _.chain(this.events)
      .map(e => e.tick + (e.duration || 0))
      .max()
      .value()
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

  _findTrackNameEvent() {
    return this.events.filter(t => t.subtype == "trackName")
  }

  _findProgramChangeEvents() {
    return this.events.filter(t => t.subtype == "programChange")
  }

  _findEndOfTrackEvents() {
    return this.events.filter(t => t.subtype == "endOfTrack")
  }

  _findVolumeEvents() {
    return this.events.filter(t => t.subtype == "controller" && t.controllerType == 7)
  }

  _findPanEvents() {
    return this.events.filter(t => t.subtype == "controller" && t.controllerType == 10)
  }

  _findSetTempoEvents() {
    return this.events.filter(t => t.subtype == "setTempo")
  }

  _updateLast(arr, obj) {
    if (arr.length > 0) {
      this.updateEvent(_.last(arr).id, obj)
    }
  }

  // 表示用の名前 トラック名がなければ楽器名を表示する
  get displayName() {
    if (this.name && this.name.length > 0) {
      return this.name
    }
    const program = this.programNumber
    if (program !== undefined) {
      return getInstrumentName(program)
    }
    return undefined
  }

  get name() {
    return lastValue(this._findTrackNameEvent(), "text")
  }

  set name(value) {
    this._updateLast(this._findTrackNameEvent(), { value })
  }

  get volume() {
    return lastValue(this._findVolumeEvents(), "value")
  }

  set volume(value) {
    this._updateLast(this._findVolumeEvents(), { value })
  }

  get pan() {
    return lastValue(this._findPanEvents(), "value")
  }

  set pan(value) {
    this._updateLast(this._findPanEvents(), { value })
  }

  get endOfTrack() {
    return lastValue(this._findEndOfTrackEvents(), "tick")
  }

  set endOfTrack(tick) {
    this._updateLast(this._findEndOfTrackEvents(), { tick })
  }

  get programNumber() {
    return lastValue(this._findProgramChangeEvents(), "value")
  }

  set programNumber(value) {
    this._updateLast(this._findProgramChangeEvents(), { value })
  }

  get tempo() {
    return 60000000 / lastValue(this._findSetTempoEvents(), "microsecondsPerBeat")
  }

  set tempo(bpm) {
    const microsecondsPerBeat = 60000000 / bpm
    this._updateLast(this._findSetTempoEvents(), { microsecondsPerBeat })
  }

  static conductorTrack(name = "Conductor Track") {
    const track = new Track()
    const events = [
      new TrackNameMidiEvent(0, name),
      new TimeSignatureMidiEvent(0, 4, 4, 24),
      new SetTempoMidiEvent(0, 60000000 / 120),
      new EndOfTrackMidiEvent(0)
    ]
    events.forEach(e => track.addEvent(e))
    return track
  }

  static emptyTrack(channel) {
    if (!Number.isInteger(channel)) {
      throw new Error("channel is not integer")
    }
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
