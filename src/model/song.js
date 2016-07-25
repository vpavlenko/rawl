class Song {
  constructor() {
    this.tracks = []
    this.name = "Untitled Song"
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
      track.addEvent(new EndOfTrackMidiEvent(0))
      song.addTrack(track)
    }

    {
      const track = new Track()
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

function getMeasuresFromConductorTrack(conductorTrack) {
  if (conductorTrack.getEvents().length == 0) {
    return [new Measure]
  } else {
    return conductorTrack.getEvents()
      .filter(e => e.subtype == "timeSignature")
      .map((e, i) => {
        console.log(`${e.numerator} / ${e.denominator}`)
        return new Measure(e.tick, i, e.numerator, e.denominator)
      })
  }
}

const defaultMBTFormatter = function(mbt, ticksPerBeat) {
  function format(v) {
    return ("   " + v).slice(-4)
  }
  return `${format(mbt.measure + 1)}:${format(mbt.beat + 1)}:${format(mbt.tick)}`
}

class MeasureList {
  constructor(conductorTrack) {
    this.measures = getMeasuresFromConductorTrack(conductorTrack)
  }

  getMeasureAt(tick) {
    let lastMeasure = new Measure()
    for (const m of this.measures) {
      if (m.startTick > tick) {
        break
      }
      lastMeasure = m
    }
    return lastMeasure
  }

  getMBTString(tick, ticksPerBeat, formatter = defaultMBTFormatter) {
    return formatter(this.getMBT(tick, ticksPerBeat))
  }

  getMBT(tick, ticksPerBeat) {
    return this.getMeasureAt(tick).getMBT(tick, ticksPerBeat)
  }
}

class Measure {
  constructor(startTick = 0, measure = 0, numerator = 4, denominator = 4) {
    this.startTick = startTick
    this.measure = measure
    this.numerator = numerator
    this.denominator = denominator
  }

  getMBT(tick, ticksPerBeatBase) {
    const ticksPerBeat = ticksPerBeatBase * 4 / this.denominator
    const ticksPerMeasure = ticksPerBeat * this.numerator

    let aTick = tick - this.startTick

    const measure = Math.floor(aTick / ticksPerMeasure)
    aTick -= measure * ticksPerMeasure

    const beat = Math.floor(aTick / ticksPerBeat)
    aTick -= beat * ticksPerBeat

    return {
      measure: this.measure + measure,
      beat: beat,
      tick: aTick
    }
  }
}
