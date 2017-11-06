import { observable, action, transaction } from "mobx"
import { json } from "json-mobx"
import _ from "lodash"

import {
  TrackNameMidiEvent, EndOfTrackMidiEvent,
  TimeSignatureMidiEvent, SetTempoMidiEvent,
  PitchBendMidiEvent, VolumeMidiEvent,
  PanMidiEvent, ExpressionMidiEvent,
  ModulationMidiEvent, ProgramChangeMidiEvent,
  ResetAllMidiEvent
} from "../midi/MidiEvent"
import { getInstrumentName } from "../midi/GM"

function lastValue(arr, prop) {
  const last = _.last(arr)
  return last && last[prop]
}

export default class Track {
  @json @observable events = []
  @json @observable lastEventId = 0
  @json @observable channel = undefined
  @json @observable endOfTrack = 0

  getEventById = (id) => _.find(this.events, e => e.id === id)

  @action updateEvent(id, obj) {
    const anObj = this.getEventById(id)
    if (!anObj) {
      console.warn(`unknown id: ${id}`)
      return
    }
    const newObj = Object.assign({}, anObj, obj)
    if (_.isEqual(newObj, anObj)) {
      return
    }
    this.replaceEvent(newObj)
    this.updateEndOfTrack()
    this.sortByTick()
    return newObj
  }

  @action updateEvents(events) {
    events.forEach(event => {
      Object.assign(this.getEventById(event.id), event)
    })
    this.updateEndOfTrack()
    this.sortByTick()
  }

  @action replaceEvent(event) {
    this.events = _.unionBy([event], this.events, "id")
  }

  @action removeEvent(id) {
    const obj = this.getEventById(id)
    this.events = _.without(this.events, obj)
    this.updateEndOfTrack()
  }

  @action removeEvents(ids) {
    const objs = ids.map(id => this.getEventById(id))
    this.events = _.difference(this.events, objs)
    this.updateEndOfTrack()
  }

  // ソート、通知を行わない内部用の addEvent
  _addEvent(e) {
    e.id = this.lastEventId
    this.lastEventId++
    this.events = [...this.events, e]

    if (e.tick === undefined) {
      const lastEvent = this.getEventById(this.lastEventId)
      e.tick = e.deltaTime + (lastEvent ? lastEvent.tick : 0)
    }
    if (e.type === "channel") {
      e.channel = this.channel
    }
  }

  @action addEvent(e) {
    this._addEvent(e)
    this.didAddEvent()
    return e
  }

  @action addEvents(events) {
    events.forEach(e => this._addEvent(e))
    this.didAddEvent()
  }

  didAddEvent(e) {
    this.updateEndOfTrack()
    this.sortByTick()
  }

  @action sortByTick() {
    this.events = _.sortBy(this.events, "tick")
  }

  updateEndOfTrack() {
    this.endOfTrack = _.chain(this.events)
      .map(e => e.tick + (e.duration || 0))
      .max()
      .value()
  }

  changeChannel(channel) {
    this.channel = channel

    for (let e of this.events) {
      if (e.type === "channel") {
        e.channel = channel
      }
    }
  }

  transaction(func) {
    transaction(() => func(this))
  }

  /* helper */

  _findTrackNameEvent() {
    return this.events.filter(t => t.subtype === "trackName")
  }

  _findProgramChangeEvents() {
    return this.events.filter(t => t.subtype === "programChange")
  }

  _findEndOfTrackEvents() {
    return this.events.filter(t => t.subtype === "endOfTrack")
  }

  _findVolumeEvents() {
    return this.events.filter(t => t.subtype === "controller" && t.controllerType === 7)
  }

  _findPanEvents() {
    return this.events.filter(t => t.subtype === "controller" && t.controllerType === 10)
  }

  _findSetTempoEvents() {
    return this.events.filter(t => t.subtype === "setTempo")
  }

  _updateLast(arr, obj) {
    if (arr.length > 0) {
      this.updateEvent(_.last(arr).id, obj)
    }
  }

  createOrUpdate(newEvent) {
    const events = this.events.filter(e =>
      e.type === newEvent.type &&
      e.subtype === newEvent.subtype &&
      e.tick === newEvent.tick)

    if (events.length > 0) {
      this.transaction(it => {
        events.forEach(e => {
          it.updateEvent(e.id, { ...newEvent, id: e.id })
        })
      })
      return events[0]
    } else {
      return this.addEvent(newEvent)
    }
  }

  // 表示用の名前 トラック名がなければトラック番号を表示する
  get displayName() {
    if (this.name && this.name.length > 0) {
      return this.name
    }
    return `Track ${this.channel}`
  }

  get instrumentName() {
    if (this.isRhythmTrack) {
      return "Standard Drum Kit"
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

  get isConductorTrack() {
    return this.channel === undefined
  }

  get isRhythmTrack() {
    return this.channel === 9
  }

  static conductorTrack(name = "Conductor Track") {
    const track = new Track()
    track.addEvents([
      new TrackNameMidiEvent(0, name),
      new TimeSignatureMidiEvent(0, 4, 4, 24),
      new SetTempoMidiEvent(0, 60000000 / 120),
      new EndOfTrackMidiEvent(0)
    ])
    return track
  }

  static emptyTrack(channel) {
    if (!Number.isInteger(channel)) {
      throw new Error("channel is not integer")
    }
    const track = new Track()
    track.channel = channel
    track.addEvents([
      new ResetAllMidiEvent(1),
      new TrackNameMidiEvent(1, ""),
      new PanMidiEvent(1, 64),
      new VolumeMidiEvent(1, 100),
      new ExpressionMidiEvent(1, 127),
      new PitchBendMidiEvent(1, 0x2000),
      new ModulationMidiEvent(1, 0),
      new ProgramChangeMidiEvent(1, 0),
      new EndOfTrackMidiEvent(1)
    ])
    return track
  }
}