import _ from "lodash"
import EventEmitter from "eventemitter3"
import assert from "assert"

import MIDIControlEvents from "constants/MIDIControlEvents"
import MIDIChannelEvents from "constants/MIDIChannelEvents"
import { eventToBytes } from "helpers/midiHelper"
import { toRawEvents } from "helpers/eventAssembler"

import EventScheduler from "./EventScheduler"

function firstByte(eventType, channel) {
  return (MIDIChannelEvents[eventType] << 4) + channel
}

function collectAllEvents(song) {
  return _.chain(song.tracks)
    .map(t => t.events.toJS())
    .flatten()
    .map(toRawEvents)
    .flatten()
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

export default class Player extends EventEmitter {
  _currentTempo = 120
  _currentTick = 0
  _scheduler = null
  loop = {
    begin: null,
    end: null,
    enabled: false
  }

  constructor(timebase, output, trackMute) {
    super()

    this._output = output
    this._timebase = timebase
    this._trackMute = trackMute
  }

  play(song) {
    assert(song, "you must provide song")
    this._song = song
    const eventsToPlay = collectAllEvents(song)
    this._scheduler = new EventScheduler(eventsToPlay, this._currentTick, this._timebase)
    setInterval(() => this._onTimer(), 50)
  }

  set position(tick) {
    if (this._scheduler) {
      this._scheduler.seek(tick)
    }
    this._currentTick = tick
    this.emitChangePosition()

    if (this.isPlaying) {
      this.allSoundsOff()
    }
  }

  get position() {
    return this._currentTick
  }

  get isPlaying() {
    return !!this._scheduler
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
    this._scheduler = null
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
    this._output.send(msg, timestamp)
  }

  _sendMessages(msg) {
    this._output.sendEvents(msg)
  }

  playNote({ channel, noteNumber, velocity, duration }) {
    const timestamp = window.performance.now()
    this._sendMessage([firstByte("noteOn", channel), noteNumber, velocity], timestamp)
    this._sendMessage([firstByte("noteOff", channel), noteNumber, 0], timestamp + this.tickToMillisec(duration))
  }

  tickToMillisec(tick) {
    return tick / (this._timebase / 60) / this._currentTempo * 1000
  }

  _shouldPlayChannel(channel) {
    const trackId = this._song.trackIdOfChannel(channel)
    return trackId ? this._trackMute.shouldPlayTrack(trackId) : true
  }

  _onTimer() {
    if (!this.isPlaying) {
      return
    }

    const timestamp = window.performance.now()
    const events = this._scheduler.readNextEvents(this._currentTempo, timestamp)

    // channel イベントを MIDI Output に送信
    const messages = events
      .filter(({ event }) => event.type === "channel" && this._shouldPlayChannel(event.channel))
      .map(({ event, timestamp }) => ({ message: eventToBytes(event, false), timestamp }))
    this._sendMessages(messages)

    // channel イベント以外を実行
    events.forEach(({ event, timestamp }) => {
      const e = event
      if (e.type !== "channel") {
        switch (e.subtype) {
          case "setTempo":
            this._currentTempo = 60000000 / e.microsecondsPerBeat
            break
          case "endOfTrack":
            break
          default:
            break
        }
      }
    })

    if (this._scheduler.currentTick >= this._song.endOfSong) {
      this.stop()
    }

    if (this._scheduler) {
      this._currentTick = this._scheduler.currentTick

      if (this.loop.enabled
        && this.loop.begin !== null
        && this._currentTick >= this.loop.end) {
        this.position = this.loop.begin
      }
    }
    this.emitChangePosition()
  }

  emitChangePosition() {
    displayTask.add("changePosition", () => {
      this.emit("change-position", this._currentTick)
    })
  }
}
