"use strict"
class EventStore {
  constructor() {
    riot.observable(this)
    this.events = []
    this.lastId = 0
  }

  _add(e) {
    e.id = this.lastId
    this.events.push(e)
    this.lastId++
  }

  add(e) {
    this._add(e)
    this.trigger("change")
  }

  addAll(arr) {
    arr.forEach(e => this._add(e))
    this.trigger("change")
  }

  getAll() {
    return this.events
  }

  clear() {
    this.events = []
    this.lastId = 0
    this.trigger("change")
  }

  removeEventsById(ids) {
    for (const id of ids) {
      this.events.remove(this.getEventById(id))
    }
    this.trigger("change")
  }

  removeById(id) {
    this.events.remove(this.getEventById(id))
    this.trigger("change")
  }

  getEventById(id) {
    for (const e of this.events) {
      if (e.id == id) {
        return e
      }
    }
  }

  update(e) {
    this.trigger("change")
  }
}
