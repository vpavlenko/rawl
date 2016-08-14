import _ from "lodash"

export default class Track {
  constructor() {
    this.events = []
    this.lastEventId = 0
    riot.observable(this)
  }

  setName(name) {
    this.name = name
    this.emitChange()
  }

  getName() {
    return this.name
  }

  getEndOfTrack() {
    return this.endOfTrack
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
    _.extend(anObj, obj)
    this.emitChange()
    return anObj
  }

  removeEvent(id) {
    const obj = this.getEventById(id)
    this.events.remove(obj)
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
    this.lastEventId++
    this.emitChange()
    return e
  }

  transaction(func) {
    this._paused = true
    func(this)
    this._paused = false
    this.emitChange()
  }

  emitChange() {
    if (!this._paused) { 
      this.trigger("change")
    }
  }

  /* helper */

  findProgramChangeEvents() {
    return this.events.filter(t => t.subtype == "programChange")
  }

  findVolumeEvents() {
    return this.events.filter(t => t.subtype == "controller" && t.controllerType == 7)
  }

  findPanEvents() {
    return this.events.filter(t => t.subtype == "controller" && t.controllerType == 10)
  }
}
