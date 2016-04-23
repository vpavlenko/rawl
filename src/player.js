const INTERVAL = 10

// timebase: 1/4拍子ごとのtick数
function secToTick(sec, bpm, timebase) {
  return sec *  bpm / 60 * timebase
}

function eventToMidiMessages(e) {
  switch (e.type) {
    case "meta":
    break
    case "channel":
      switch (e.subtype) {
        case "note":
        return [
          {
            msg: [0x90 + e.channel, e.noteNumber, e.velocity],  // note on
            tick: e.tick
          },
          {
            msg: [0x80 + e.channel, e.noteNumber, 0x40],
            tick: e.tick + e.duration
          }
        ]
      }
    break
  }
  return null
}

class Player {
  constructor(eventStore, timebase) {
    bindAllMethods(this)
    this.eventStore = eventStore
    this.timebase = timebase
    this.playing = false

    navigator.requestMIDIAccess().then((midiAccess) => {
      this.midiOutput = midiAccess.outputs.values().next().value;
    }, null)
  }

  playAt(tick) {
    this.playing = true
    this.currentTick = tick
    this.events = this.eventStore.events
      .filter(e => e.tick >= tick)
      .map(e => eventToMidiMessages(e))
      .filter(e => e != null)
      .flatten()
    this.intervalID = setInterval(this.onTimer, INTERVAL)
  }

  stop() {
    clearInterval(this.intervalID)
    this.playing = false
  }

  onTimer() {
    const currentTempo = 120 // TODO: use setTempo event
    const deltaTick = secToTick(INTERVAL / 1000, currentTempo, this.timebase)
    const endTick = this.currentTick + deltaTick
    const eventsToPlay = this.events.filter((e) => {
      return e.tick <= endTick
    })
    this.events.deleteArray(eventsToPlay)
    this.currentTick = endTick

    const timestamp = window.performance.now()
    eventsToPlay.forEach(e => {
      this.midiOutput.send(e.msg, timestamp)
    })
  }
}
