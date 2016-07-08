"use strict"
const INTERVAL = 1 / 15 * 1000  // low fps

// timebase: 1/4拍子ごとのtick数
function secToTick(sec, bpm, timebase) {
  return sec *  bpm / 60 * timebase
}

function tickToMillisec(tick, bpm, timebase) {
  return tick / (timebase / 60) / bpm * 1000
}

const EVENT_CODES = {
  "noteOff": 0x8,
  "noteOn": 0x9,
  "noteAftertouch": 0xa,
  "controller": 0xb,
  "programChange": 0xc,
  "channelAftertouch": 0xd,
  "pitchBend": 0xe,
}

function checkHex(val) {
  if (val >= 0xFF) {
    //debugger
  }
}

function firstByte(eventType, channel) {
  return (EVENT_CODES[eventType] << 4) + channel
}

function eventToMidiMessages(e) {
  function eventType(e) {
    return firstByte(e.subtype, e.channel)
  }
  function createMessage(e, data) {
    return [{
      event: e,
      tick: e.tick,
      msg: [eventType(e)].concat(data)
    }]
  }
  switch (e.type) {
    case "meta":
    break
    case "channel":
      switch (e.subtype) {
        case "note":
        return [
          {
            event: e,
            msg: [firstByte("noteOn", e.channel), e.noteNumber, e.velocity],
            tick: e.tick
          },
          {
            event: e,
            msg: [firstByte("noteOff", e.channel), e.noteNumber, 0x40],
            tick: e.tick + e.duration - 1 // prevent overlapping next note on
          }
        ]
        case "noteAftertouch":
        return createMessage(e, [e.noteNumber, e.amount])
        case "controller":
        return createMessage(e, [e.controllerType, e.value])
        case "programChange":
        return createMessage(e, [e.programNumber])
        case "channelAftertouch":
        return createMessage(e, [e.amount])
        case "pitchBend":
        return createMessage(e, [e.value & 0x7f, e.value >> 7])
      }
    break
  }
  return [{
    event: e,
    tick: e.tick
  }]
}

class Player {
  constructor(timebase) {
    bindAllMethods(this)
    this._timebase = timebase
    this._playing = false
    this._currentTempo = 120
    this._currentTick = 0
    this._allEvents = []

    navigator.requestMIDIAccess().then(midiAccess => {
      this._midiOutput = midiAccess.outputs.values().next().value;
    }, null)
  }

  prepare(song) {
    this._allEvents = song.getTracks()
      .map(t => t.getEvents())
      .flatten()
      .map(eventToMidiMessages)
      .filter(e => e != null)
      .flatten()
  }

  _updateEvents() {
    this._events = this._allEvents.filter(e => e.tick >= this._currentTick)
  }

  // you must call prepare() before play(), playAt()
  play(tick) {
    if (tick) {
      this._currentTick = Math.max(0, tick)
    }
    this._updateEvents()
    this.resume()
  }

  seek(tick) {
    this._currentTick = Math.max(0, tick)
    this._updateEvents()
  }

  set position(tick) {
    this.seek(tick)
  }

  get position() {
    return this._currentTick
  }

  get isPlaying() {
    return this._playing
  }

  resume() {
    this._playing = true
    clearInterval(this._intervalID)
    this._intervalID = setInterval(this._onTimer, INTERVAL)
  }

  stop() {
    clearInterval(this._intervalID)
    this._playing = false

    // all sound off
    for (const ch of Array.range(0, 0xf)) {
      this._midiOutput.send([0xb0 + ch, MIDIController.ALL_SOUNDS_OFF, 0], window.performance.now())
    }
  }

  reset() {
    const time = window.performance.now()
    for (const ch of Array.range(0, 0xf)) {
      // reset controllers
      this._midiOutput.send([firstByte("controller", ch), MIDIController.RESET_CONTROLLERS, 0x7f], time)

      // reset pitch bend
      this._midiOutput.send([firstByte("pitchBend", ch), 0x00, 0x40], time)
    }
    this.stop()
    this.position = 0
  }

  /**
   preview note
   duration in milliseconds
   */
  playNote(n) {
    const timestamp = window.performance.now()
    this._midiOutput.send([firstByte("noteOn", n.channel), n.noteNumber, n.velocity], timestamp)
    this._midiOutput.send([firstByte("noteOff", n.channel), n.noteNumber, 0], timestamp + n.duration)
  }

  _onTimer() {
    const deltaTick = Math.ceil(secToTick(INTERVAL / 1000, this._currentTempo, this._timebase))
    const endTick = this._currentTick + deltaTick
    const eventsToPlay = this._events.filter(e => e.tick <= endTick)
    this._events.deleteArray(eventsToPlay)

    const timestamp = window.performance.now()
    eventsToPlay.forEach(e => {
      if (e.msg != null) {
        const waitTick = e.tick - this._currentTick
        this._midiOutput.send(e.msg, timestamp + tickToMillisec(waitTick, this._currentTempo, this._timebase))
      } else {
        // MIDI 以外のイベントを実行
        switch (e.event.subtype) {
          case "setTempo":
          this._currentTempo = 60000000 / e.event.microsecondsPerBeat
          console.log(this._currentTempo)
          break
          case "endOfTrack":
          this.stop()
          break
        }
      }
    })

    this._currentTick = endTick
  }
}
