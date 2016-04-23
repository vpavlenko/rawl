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
            event: e,
            msg: [0x90 + e.channel, e.noteNumber, e.velocity],  // note on
            tick: e.tick
          },
          {
            event: e,
            msg: [0x80 + e.channel, e.noteNumber, 0x40],
            tick: e.tick + e.duration
          }
        ]
      }
    break
  }
  return {
    event: e,
    tick: e.tick
  }
}

class Player {
  constructor(eventStore, timebase) {
    bindAllMethods(this)
    this.eventStore = eventStore
    this.timebase = timebase
    this.playing = false
    this.currentTempo = 120

    navigator.requestMIDIAccess().then(midiAccess => {
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
    const deltaTick = secToTick(INTERVAL / 1000, this.currentTempo, this.timebase)
    const endTick = this.currentTick + deltaTick
    const eventsToPlay = this.events.filter(e => e.tick <= endTick)
    this.events.deleteArray(eventsToPlay)
    this.currentTick = endTick

    const timestamp = window.performance.now()
    eventsToPlay.forEach(e => {
      if (e.msg != null) {
        this.midiOutput.send(e.msg, timestamp)
      } else {
        // MIDI 以外のイベントを実行
        if (e.event.subtype == "setTempo") {
          this.currentTempo = 60000000 / e.event.microsecondsPerBeat
          console.log(this.currentTempo)
        }
      }
    })
  }
}
