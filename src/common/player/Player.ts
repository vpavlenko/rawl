import flatten from "lodash/flatten"
import range from "lodash/range"
import EventEmitter from "eventemitter3"

import {
  serialize as serializeMidiEvent,
  MIDIControlEvents,
  MIDIChannelEvents,
  AnyEvent,
} from "midifile-ts"

import EventScheduler from "./EventScheduler"
import Song from "common/song"
import TrackMute from "common/trackMute"
import { deassemble as deassembleNote } from "common/helpers/noteAssembler"
import { deassemble as deassembleRPN } from "common/helpers/RPNAssembler"
import { NoteEvent } from "../track"
import { PlayerEvent } from "./PlayerEvent"
import SynthOutput, { Message } from "../../main/services/SynthOutput"

function firstByte(eventType: string, channel: number): number {
  return (MIDIChannelEvents[eventType] << 4) + channel
}

function collectAllEvents(song: Song): PlayerEvent[] {
  return flatten(
    song.tracks.map((t) => {
      const a = flatten(t.events.map((e) => deassembleNote(e)))
      const b = flatten(
        a.map((e) => deassembleRPN(e, (x) => ({ ...x, tick: e.tick })))
      )
      return b.map((e) => ({ ...e, channel: t.channel } as any))
    })
  )
}

// 同じ名前のタスクを描画タイマーごとに一度だけ実行する
class DisplayTask {
  tasks: { [index: string]: () => void } = {}

  constructor() {
    setInterval(() => this.perform(), 50)
  }

  add(name: string, func: () => void) {
    this.tasks[name] = func
  }

  perform() {
    Object.values(this.tasks).forEach((t) => t())
    this.tasks = {}
  }
}

const displayTask = new DisplayTask()

export interface LoopSetting {
  begin: number
  end: number
  enabled: boolean
}

const TIMER_INTERVAL = 50

export default class Player extends EventEmitter {
  private _currentTempo = 120
  private _currentTick = 0
  private _scheduler: EventScheduler<PlayerEvent> | null = null
  private _song: Song
  private _output: SynthOutput
  private _timebase: number
  private _trackMute: TrackMute
  private _latency: number = 100
  private _timer?: NodeJS.Timeout

  loop: LoopSetting = {
    begin: 0,
    end: 0,
    enabled: false,
  }

  constructor(timebase: number, output: SynthOutput, trackMute: TrackMute) {
    super()

    this._output = output
    this._timebase = timebase
    this._trackMute = trackMute
  }

  play(song: Song) {
    this._song = song
    const eventsToPlay = collectAllEvents(song)
    this._scheduler = new EventScheduler(
      eventsToPlay,
      this._currentTick,
      this._timebase,
      500
    )
    this._output.activate()

    if (this._timer) {
      clearInterval(this._timer)
    }
    this._timer = setInterval(() => this._onTimer(), TIMER_INTERVAL)
  }

  set position(tick: number) {
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

  allSoundsOffChannel(ch: number) {
    this._sendMessage(
      [0xb0 + ch, MIDIControlEvents.ALL_SOUNDS_OFF, 0],
      window.performance.now()
    )
  }

  allSoundsOff() {
    for (const ch of range(0, this.numberOfChannels)) {
      this.allSoundsOffChannel(ch)
    }
  }

  allSoundsOffExclude(channel: number) {
    for (const ch of range(0, this.numberOfChannels)) {
      if (ch !== channel) {
        this.allSoundsOffChannel(ch)
      }
    }
  }

  stop() {
    this._scheduler = null
    this.allSoundsOff()
    this.prevTimestamp = null

    if (this._timer) {
      clearInterval(this._timer)
    }
  }

  reset() {
    const time = window.performance.now()
    for (const ch of range(0, this.numberOfChannels)) {
      // reset controllers
      this._sendMessage(
        [
          firstByte("controller", ch),
          MIDIControlEvents.RESET_CONTROLLERS,
          0x7f,
        ],
        time
      )
    }
    this.stop()
    this.position = 0
  }

  get currentTempo() {
    return this._currentTempo
  }

  _sendMessage(msg: number[], timestamp: number) {
    this._output.send(msg, timestamp)
  }

  _sendMessages(msg: Message[]) {
    this._output.sendEvents(msg)
  }

  playNote({
    channel,
    noteNumber,
    velocity,
    duration,
  }: Pick<NoteEvent, "noteNumber" | "velocity" | "duration"> & {
    channel: number
  }) {
    this._output.activate()
    const timestamp = window.performance.now() + this._latency
    this._sendMessage(
      [firstByte("noteOn", channel), noteNumber, velocity],
      timestamp
    )
    this._sendMessage(
      [firstByte("noteOff", channel), noteNumber, 0],
      timestamp + this.tickToMillisec(duration)
    )
  }

  tickToMillisec(tick: number) {
    return (tick / (this._timebase / 60) / this._currentTempo) * 1000
  }

  private _shouldPlayChannel(channel: number) {
    const trackId = this._song.trackIdOfChannel(channel)
    return trackId ? this._trackMute.shouldPlayTrack(trackId) : true
  }

  sendEvent(event: AnyEvent) {
    const timestamp = window.performance.now() + this._latency
    const message = serializeMidiEvent(event as any, false)
    this._sendMessage(message, timestamp)
  }

  private prevTimestamp: number | null = null

  private _onTimer() {
    if (this._scheduler === null) {
      return
    }

    const timestamp = window.performance.now()
    const events = this._scheduler.readNextEvents(this._currentTempo, timestamp)

    if (this.prevTimestamp !== null) {
      const jitter = timestamp - this.prevTimestamp - TIMER_INTERVAL
      if (jitter / TIMER_INTERVAL > 2) {
        console.warn(`timer have big jitter: ${jitter}`)
      }
    }

    // channel イベントを MIDI Output に送信
    const messages = events
      .filter(
        ({ event }) =>
          event.type === "channel" && this._shouldPlayChannel(event.channel)
      )
      .map(({ event, timestamp }) => ({
        message: serializeMidiEvent(event as any, false),
        timestamp: timestamp + this._latency,
      }))
    this._sendMessages(messages)

    // channel イベント以外を実行
    events.forEach(({ event }) => {
      const e = event
      if (e.type !== "channel" && "subtype" in e) {
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

      if (
        this.loop.enabled &&
        this.loop.begin !== null &&
        this._currentTick >= this.loop.end
      ) {
        this.position = this.loop.begin
      }
    }
    this.emitChangePosition()

    this.prevTimestamp = timestamp
  }

  emitChangePosition() {
    displayTask.add("changePosition", () => {
      this.emit("change-position", this._currentTick)
    })
  }
}
