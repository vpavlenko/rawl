import flatten from "lodash/flatten"
import range from "lodash/range"
import throttle from "lodash/throttle"
import {
  AnyEvent,
  MIDIChannelEvents,
  MIDIControlEvents,
  serialize as serializeMidiEvent,
} from "midifile-ts"
import { computed, observable } from "mobx"
import { Message, SynthOutput } from "../../main/services/SynthOutput"
import { deassemble as deassembleNote } from "../helpers/noteAssembler"
import { deassemble as deassembleRPN } from "../helpers/RPNAssembler"
import Song from "../song"
import { NoteEvent, resetTrackMIDIEvents } from "../track"
import TrackMute from "../trackMute"
import { AdaptiveTimer } from "./AdaptiveTimer"
import EventScheduler from "./EventScheduler"
import { PlayerEvent } from "./PlayerEvent"

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

export interface LoopSetting {
  begin: number
  end: number
  enabled: boolean
}

const TIMER_INTERVAL = 50

export default class Player {
  private _currentTempo = 120
  private _scheduler: EventScheduler<PlayerEvent> | null = null
  private _song: Song | null = null
  private _output: SynthOutput
  private _timebase: number
  private _trackMute: TrackMute
  private _latency: number = 100
  private _timer = new AdaptiveTimer(
    (timestamp) => this._onTimer(timestamp),
    TIMER_INTERVAL
  )
  @observable private _currentTick = 0
  @observable private _isPlaying = false

  @observable loop: LoopSetting = {
    begin: 0,
    end: 0,
    enabled: false,
  }

  constructor(timebase: number, output: SynthOutput, trackMute: TrackMute) {
    this._output = output
    this._timebase = timebase
    this._trackMute = trackMute
  }

  play(song: Song) {
    if (this.isPlaying) {
      console.warn("called play() while playing. aborted.")
      return
    }
    this._song = song
    const eventsToPlay = collectAllEvents(song)
    this._scheduler = new EventScheduler(
      eventsToPlay,
      this._currentTick,
      this._timebase,
      500
    )
    this._isPlaying = true
    this._output.activate()
    this._timer.start()
  }

  set position(tick: number) {
    tick = Math.min(
      Math.max(tick, 0),
      this._song?.endOfSong ?? Number.MAX_VALUE
    )
    if (this._scheduler) {
      this._scheduler.seek(tick)
    }
    this._currentTick = tick

    if (this.isPlaying) {
      this.allSoundsOff()
    }
  }

  @computed get position() {
    return this._currentTick
  }

  @computed get isPlaying() {
    return this._isPlaying
  }

  get timebase() {
    return this._timebase
  }

  set timebase(value: number) {
    this._timebase = value
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
    this._isPlaying = false
    this._timer.stop()
  }

  reset() {
    const timestamp = window.performance.now()
    for (const ch of range(0, this.numberOfChannels)) {
      // reset controllers
      const resetControllers = {
        message: [
          firstByte("controller", ch),
          MIDIControlEvents.RESET_CONTROLLERS,
          0x7f,
        ],
        timestamp,
      }
      const resetMessages = resetTrackMIDIEvents(ch)
        .map((e) => serializeMidiEvent(e, false))
        .map((message) => ({ message, timestamp }))
      const messages = [resetControllers, ...resetMessages]
      this._sendMessages(messages)
    }
    this.stop()
    this.position = 0
  }

  get currentTempo() {
    return this._currentTempo
  }

  set currentTempo(value: number) {
    this._currentTempo = value
  }

  private _sendMessage(message: number[], timestamp: number) {
    this._sendMessages([{ message, timestamp }])
  }

  private _sendMessages(msg: Message[]) {
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
    const trackId = this._song?.trackIdOfChannel(channel)
    return trackId ? this._trackMute.shouldPlayTrack(trackId) : true
  }

  sendEvent(event: AnyEvent) {
    const timestamp = window.performance.now() + this._latency
    const message = serializeMidiEvent(event as any, false)
    this._sendMessage(message, timestamp)
  }

  private syncPosition = throttle(() => {
    if (this._scheduler !== null) {
      this._currentTick = this._scheduler.currentTick
    }
  }, 50)

  private _onTimer(timestamp: number) {
    if (this._scheduler === null || this._song === null) {
      return
    }

    const events = this._scheduler.readNextEvents(this._currentTempo, timestamp)

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
    } else {
      const currentTick = this._scheduler.currentTick

      if (
        this.loop.enabled &&
        this.loop.begin !== null &&
        currentTick >= this.loop.end
      ) {
        this.position = this.loop.begin
      }
    }

    this.syncPosition()
  }
}
