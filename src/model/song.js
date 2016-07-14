class Song {
  constructor() {
    this.tracks = []
    riot.observable(this)
  }

  addTrack(t) {
    t.channel = t.channel || this.tracks.length
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

  static emptySong() {
    const song = new Song()
    song.addTrack(new Track())
    return song
  }

  static fromMidi(midi) {
    const song = new Song
    midi.tracks.forEach(t => {
      const track = new Track
      t.events.forEach(e => {
        track.addEvent(e)
      })
      track.name = t.name
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

class Track {
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