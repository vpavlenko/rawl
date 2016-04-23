class EventStore {
  constructor() {
    riot.observable(this)
    this.events = []
    this.lastId = 0
  }

  _add(e) {
    e.id = this.lastId
    this.lastId++
  }

  add(e) {
    this._add(e)
    this.events.push(e)
    this.trigger("change")
  }

  addAll(arr) {
    arr.forEach(e => this._add(e))
    this.events = this.events.concat(arr)
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
