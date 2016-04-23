class EventStore {
  constructor() {
    riot.observable(this)
    this.events = []
  }
  add(obj) {
    this.events.push(obj)
    this.trigger("change")
  }
  addAll(arr) {
    this.events = this.events.concat(arr)
    this.trigger("change")
  }
}
