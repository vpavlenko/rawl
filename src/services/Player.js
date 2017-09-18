import _ from "lodash"
import EventEmitter from "eventemitter3"
import assert from "assert"

import MIDIControlEvents from "../constants/MIDIControlEvents"
import MIDIChannelEvents from "../constants/MIDIChannelEvents"
import { eventToBytes } from "../helpers/midiHelper"
import { deassemble } from "../helpers/noteAssembler"

function firstByte(eventType, channel) {
  return (MIDIChannelEvents[eventType] << 4) + channel
}

function collectAllEvents(song) {
  return _.chain(song.tracks)
    .map(t => t.getEvents())
    .flatten()
    .map(deassemble)
    .flatten()
    .value()
}

function filterEventsRange(events, startTick, endTick) {
  return events
    .filter(e => e && e.tick >= startTick && e.tick <= endTick)
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

export default class Player extends EventEmitter {
  _playing = false
  _currentTempo = 120
  _currentTick = 0
  _prevTime = 0
  _eventsToPlay = []

  constructor(timebase, output, trackMute) {
    super()

    this._output = output
    this._timebase = timebase
    this._trackMute = trackMute
  }

  set song(song) {
    this._song = song
  }

  play() {
    assert(this._song, "you must set song before play")
    this._playing = true
    this._prevTime = window.performance.now()
    this._eventsToPlay = collectAllEvents(this._song)

    const loop = () => {
      if (this._playing) {
        this._onTimer()
      }
    }
    setInterval(loop, 33)
  }

  set position(tick) {
    this._currentTick = Math.max(0, tick)
    this.emitChangePosition()

    if (this.isPlaying) {
      this.allSoundsOff()
    }
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

  get numberOfChannels() {
    return 0xf
  }

  allSoundsOffChannel(ch) {
    this._sendMessage([0xb0 + ch, MIDIControlEvents.ALL_SOUNDS_OFF, 0], window.performance.now())
  }

  allSoundsOff() {
    for (const ch of _.range(0, this.numberOfChannels)) {
      this.allSoundsOffChannel(ch)
    }
  }

  allSoundsOffExclude(channel) {
    for (const ch of _.range(0, this.numberOfChannels)) {
      if (ch !== channel) {
        this.allSoundsOffChannel(ch)
      }
    }
  }

  stop() {
    this._playing = false
    this._eventsToPlay = []
    this.allSoundsOff()
  }

  reset() {
    const time = window.performance.now()
    for (const ch of _.range(0, this.numberOfChannels)) {
      // reset controllers
      this._sendMessage([firstByte("controller", ch), MIDIControlEvents.RESET_CONTROLLERS, 0x7f], time)
    }
    this.stop()
    this.position = 0
  }

  get currentTempo() {
    return this._currentTempo
  }

  _sendMessage(msg, timestamp) {
    this._output.send(msg, Math.round(timestamp))
  }

  playNote({ channel, noteNumber, velocity, duration }) {
    const timestamp = window.performance.now() + 100
    this._sendMessage([firstByte("noteOn", channel), noteNumber, velocity], timestamp)
    this._sendMessage([firstByte("noteOff", channel), noteNumber, 0], timestamp + this.tickToMillisec(duration))
  }

  secToTick(sec) {
    // timebase: 1/4拍子ごとのtick数
    return sec * this._currentTempo / 60 * this._timebase
  }

  tickToMillisec(tick) {
    return tick / (this._timebase / 60) / this._currentTempo * 1000
  }

  _shouldPlayChannel(channel) {
    const trackId = this._song.trackIdOfChannel(channel)
    return trackId ? this._trackMute.shouldPlayTrack(trackId) : true
  }

  _onTimer() {
    const timestamp = window.performance.now()
    const deltaTime = timestamp - this._prevTime
    const deltaTick = this.secToTick(deltaTime / 1000)
    const endTick = this._currentTick + deltaTick

    const events = filterEventsRange(this._eventsToPlay, this._currentTick, endTick)

    // channel イベントを MIDI Output に送信
    events
      .filter(e => e.type === "channel" && this._shouldPlayChannel(e.channel))
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
            this.emit("change-tempo", this._currentTempo)
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

    this._prevTime = timestamp
    this._currentTick = endTick
    this.emitChangePosition()
  }

  emitChangePosition() {
    displayTask.add("changePosition", () => {
      this.emit("change-position", this._currentTick)
    })
  }
}
