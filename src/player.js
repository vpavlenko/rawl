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
  constructor(eventStore, timebase) {
    bindAllMethods(this)
    this.eventStore = eventStore
    this.timebase = timebase
    this.playing = false
    this.currentTempo = 120
    this.currentTick = 0

    navigator.requestMIDIAccess().then(midiAccess => {
      this.midiOutput = midiAccess.outputs.values().next().value;
    }, null)
  }

  playAt(tick) {
    this.playing = true
    this.currentTick = tick
    this.events = this.eventStore.events
      .filter(e => e.tick >= tick)
      .map(eventToMidiMessages)
      .filter(e => e != null)
      .flatten()
    this.intervalID = setInterval(this.onTimer, INTERVAL)
  }

  set position(tick) {
    this.currentTick = tick
  }

  get position() {
    return this.currentTick
  }

  resume() {
    this.playAt(this.currentTick)
  }

  stop() {
    clearInterval(this.intervalID)
    this.playing = false

    // all sound off
    for (const ch of Array.range(0, 0xf)) {
      this.midiOutput.send([0xb0 + ch, 0x78, 0], window.performance.now())
    }
  }

  reset() {
    // reset all controllers
    for (const ch of Array.range(0, 0xf)) {
      this.midiOutput.send([0xb0 + ch, 0x79, 0x7f], window.performance.now())
    }
    this.stop()
    this.position = 0
  }

  /**
   preview note
   duration in milliseconds
   */
  playNote(channel, noteNumber, velocity, duration) {
    const timestamp = window.performance.now()
    this.midiOutput.send([firstByte("noteOn", channel), noteNumber, velocity], timestamp)
    this.midiOutput.send([firstByte("noteOff", channel), noteNumber, 0], timestamp + duration)
  }

  onTimer() {
    const deltaTick = Math.ceil(secToTick(INTERVAL / 1000, this.currentTempo, this.timebase))
    const endTick = this.currentTick + deltaTick
    const eventsToPlay = this.events.filter(e => e.tick <= endTick)
    this.events.deleteArray(eventsToPlay)

    const timestamp = window.performance.now()
    eventsToPlay.forEach(e => {
      if (e.msg != null) {
        const waitTick = e.tick - this.currentTick
        this.midiOutput.send(e.msg, timestamp + tickToMillisec(waitTick, this.currentTempo, this.timebase))
      } else {
        // MIDI 以外のイベントを実行
        switch (e.event.subtype) {
          case "setTempo":
          this.currentTempo = 60000000 / e.event.microsecondsPerBeat
          console.log(this.currentTempo)
          break
          case "endOfTrack":
          this.stop()
          break
        }
      }
    })

    this.currentTick = endTick
  }
}
