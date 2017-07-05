import _ from "lodash"
import observable from "riot-observable"
import MIDIControlEvents from "../constants/MIDIControlEvents"
import MIDIChannelEvents from "../constants/MIDIChannelEvents"
import { deassembleNoteEvents, eventToBytes } from "../helpers/midiHelper"
import assert from "assert"

const INTERVAL = 1 / 15 * 1000 // seconds

// timebase: 1/4拍子ごとのtick数
function secToTick(sec, bpm, timebase) {
  return sec *  bpm / 60 * timebase
}

function tickToMillisec(tick, bpm, timebase) {
  return tick / (timebase / 60) / bpm * 1000
}

function firstByte(eventType, channel) {
  return (MIDIChannelEvents[eventType] << 4) + channel
}

function getEventsToPlay(song, startTick, endTick) {
  return _.chain(song.tracks)
    .map(t => t.getEvents())
    .flatten()
    .map(deassembleNoteEvents)
    .flatten()
    .filter(e => e && e.tick >= startTick && e.tick <= endTick)
    .value()
}

// 同じ名前のタスクを描画タイマーごとに一度だけ実行する
class DisplayTask {
  constructor() {
    this.tasks = {}
    setInterval(() => this.perform(), 50)
  }

  add(name, func) {
    this.tasks[name] = func
  }

  perform() {
    _.values(this.tasks).forEach(t => t())
    this.tasks = {}
  }
}

const displayTask = new DisplayTask()

export default class Player {
  constructor(timebase) {
    this._timebase = timebase
    this._playing = false
    this._currentTempo = 120
    this._currentTick = 0
    this._channelMutes = {}

    observable(this)

    const url = "./sf2.html"
    this.synthWindow = window.open(url, "sy1", "width=900,height=670,scrollbars=yes,resizable=yes")
  }

  set song(song) {
    this._song = song
  }

  play() {
    assert(this._song, "you must set song before play")
    this._playing = true
    clearInterval(this._intervalID)
    this._intervalID = setInterval(this._onTimer.bind(this), INTERVAL)
  }

  set position(tick) {
    this._currentTick = Math.max(0, tick)
    this.emitChangePosition()
    this.allSoundsOff()
  }

  get position() {
    return this._currentTick
  }

  get isPlaying() {
    return this._playing
  }

  get timebase() {
    return this._timebase
  }

  allSoundsOff() {
    for (const ch of _.range(0, 0xf)) {
      this._sendMessage([0xb0 + ch, MIDIControlEvents.ALL_SOUNDS_OFF, 0], window.performance.now())
    }
  }

  stop() {
    clearInterval(this._intervalID)
    this._playing = false
    this.allSoundsOff()
  }

  reset() {
    const time = window.performance.now()
    for (const ch of _.range(0, 0xf)) {
      // reset controllers
      this._sendMessage([firstByte("controller", ch), MIDIControlEvents.RESET_CONTROLLERS, 0x7f], time)
    }
    this.stop()
    this.position = 0
  }

  get currentTempo() {
    return this._currentTempo
  }

  muteChannel(channel, mute) {
    this._channelMutes[channel] = mute
    this.trigger("change-mute", channel)
  }

  isChannelMuted(channel) {
    return this._channelMutes[channel]
  }

  _sendMessage(msg, timestamp) {
    const delay = timestamp - window.performance.now()

    setTimeout(() => {
      const aMsg = ["midi", ...msg.map(m => m.toString(16))].join(",")
      if (this.synthWindow) {
        this.synthWindow.postMessage(aMsg, "*")
      }
    }, delay)
  }

  playNote({channel, noteNumber, velocity, duration}) {
    const timestamp = window.performance.now()
    this._sendMessage([firstByte("noteOn", channel), noteNumber, velocity], timestamp)
    this._sendMessage([firstByte("noteOff", channel), noteNumber, 0], timestamp + this.tickToMillisec(duration))
  }

  secToTick(sec) {
    return secToTick(sec, this._currentTempo, this._timebase)
  }

  tickToMillisec(tick) {
    return tickToMillisec(tick, this._currentTempo, this._timebase)
  }

  _onTimer() {
    const deltaTick = Math.ceil(this.secToTick(INTERVAL / 1000))
    const endTick = this._currentTick + deltaTick
    const timestamp = window.performance.now()

    const events = getEventsToPlay(this._song, this._currentTick, endTick)

    // channel イベントを MIDI Output に送信
    events
      .filter(e => e.type === "channel" && !this._channelMutes[e.channel])
      .forEach(e => {
        const bytes = eventToBytes(e, false)
        const waitTick = e.tick - this._currentTick
        this._sendMessage(bytes, timestamp + this.tickToMillisec(waitTick))
      })

    // channel イベント以外を実行
    events
      .filter(e => e.type !== "channel")
      .forEach(e => {
        switch (e.subtype) {
          case "setTempo":
            this._currentTempo = 60000000 / e.microsecondsPerBeat
            this.trigger("change-tempo", this._currentTempo)
            break
          case "endOfTrack":
            break
          default:
            break
        }
      })

    if (this._currentTick >= this._song.endOfSong) {
      this.stop()
    }

    this._currentTick = endTick
    this.emitChangePosition()
  }

  emitChangePosition() {
    displayTask.add("changePosition", () => {
      this.trigger("change-position", this._currentTick)
    })
  }
}
