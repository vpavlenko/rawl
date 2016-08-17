import _ from "lodash"
import observable from "riot-observable"

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
}
