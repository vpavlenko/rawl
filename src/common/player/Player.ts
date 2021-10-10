import { getSamplesFromSoundFont, SynthEvent } from "@ryohey/wavelet"
import flatten from "lodash/flatten"
import range from "lodash/range"
import throttle from "lodash/throttle"
import { AnyEvent, MIDIChannelEvents, MIDIControlEvents } from "midifile-ts"
import { computed, makeObservable, observable } from "mobx"
import { SynthOutput } from "../../main/services/SynthOutput"
import { deassemble as deassembleNote } from "../helpers/noteAssembler"
import { deassemble as deassembleRPN } from "../helpers/RPNAssembler"
import {
  controllerMidiEvent,
  noteOffMidiEvent,
  noteOnMidiEvent,
} from "../midi/MidiEvent"
import Song from "../song"
import { NoteEvent, resetTrackMIDIEvents, TrackEvent } from "../track"
import { getStatusEvents } from "../track/selector"
import TrackMute from "../trackMute"
import { DistributiveOmit } from "../types"
import { AdaptiveTimer } from "./AdaptiveTimer"
import EventScheduler from "./EventScheduler"
import { PlayerEvent } from "./PlayerEvent"

function firstByte(eventType: string, channel: number): number {
  return (MIDIChannelEvents[eventType] << 4) + channel
}

function convertTrackEvents(events: TrackEvent[], channel: number | undefined) {
  const a = flatten(events.map((e) => deassembleNote(e)))
  const b = flatten(
    a.map((e) => deassembleRPN(e, (x) => ({ ...x, tick: e.tick })))
  )
  return b.map((e) => ({ ...e, channel: channel } as PlayerEvent))
}

function collectAllEvents(song: Song): PlayerEvent[] {
  return flatten(
    song.tracks.map((t) => convertTrackEvents(t.events, t.channel))
  )
}

export interface LoopSetting {
  begin: number
  end: number
  enabled: boolean
}

interface SongStore {
  song: Song
}

const TIMER_INTERVAL = 50

export default class Player {
  private _currentTempo = 120
  private _scheduler: EventScheduler<PlayerEvent> | null = null
  private _songStore: SongStore
  private _output: SynthOutput
  private _trackMute: TrackMute
  private _latency: number = 100
  private _timer = new AdaptiveTimer(
    (timestamp) => this._onTimer(timestamp),
    TIMER_INTERVAL
  )
  private _currentTick = 0
  private _isPlaying = false
  private synth: AudioWorkletNode | null = null
  private context = new AudioContext()

  disableSeek: boolean = false

  loop: LoopSetting = {
    begin: 0,
    end: 0,
    enabled: false,
  }

  constructor(output: SynthOutput, trackMute: TrackMute, songStore: SongStore) {
    makeObservable<Player, "_currentTick" | "_isPlaying">(this, {
      _currentTick: observable,
      _isPlaying: observable,
      loop: observable,
      position: computed,
      isPlaying: computed,
    })

    this._output = output
    this._trackMute = trackMute
    this._songStore = songStore

    this.setupSynth()
  }

  private async setupSynth() {
    const url = new URL("@ryohey/wavelet/dist/processor.js", import.meta.url)
    await this.context.audioWorklet.addModule(url)

    this.synth = new AudioWorkletNode(this.context, "synth-processor", {
      numberOfInputs: 0,
      outputChannelCount: [2],
    } as any)
    this.synth.connect(this.context.destination)

    await this.loadSoundFont()
  }

  private async loadSoundFont() {
    const url = "/A320U.sf2"
    const data = await (await fetch(url)).arrayBuffer()
    const parsed = getSamplesFromSoundFont(new Uint8Array(data), this.context)

    for (const sample of parsed) {
      this.postSynthMessage(
        {
          type: "loadSample",
          sample,
          bank: sample.bank,
          instrument: sample.instrument,
          keyRange: sample.keyRange,
          velRange: sample.velRange,
        },
        [sample.buffer] // transfer instead of copy)
      )
    }
  }

  private get song() {
    return this._songStore.song
  }

  private get timebase() {
    return this.song.timebase
  }

  play() {
    this.context.resume()

    if (this.isPlaying) {
      console.warn("called play() while playing. aborted.")
      return
    }
    const eventsToPlay = collectAllEvents(this.song)
    this._scheduler = new EventScheduler(
      eventsToPlay,
      this._currentTick,
      this.timebase,
      500
    )
    this._isPlaying = true
    this._output.activate()
    this._timer.start()
  }

  set position(tick: number) {
    if (!Number.isInteger(tick)) {
      console.warn("Player.tick should be an integer", tick)
    }
    if (this.disableSeek) {
      return
    }
    tick = Math.min(Math.max(Math.floor(tick), 0), this.song.endOfSong)
    if (this._scheduler) {
      this._scheduler.seek(tick)
    }
    this._currentTick = tick

    if (this.isPlaying) {
      this.allSoundsOff()
    }

    this.sendCurrentStateEvents()
  }

  get position() {
    return this._currentTick
  }

  get isPlaying() {
    return this._isPlaying
  }

  get numberOfChannels() {
    return 0xf
  }

  allSoundsOffChannel(ch: number) {
    this.sendEvent(
      controllerMidiEvent(0, ch, MIDIControlEvents.ALL_SOUNDS_OFF, 0)
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
    for (const ch of range(0, this.numberOfChannels)) {
      const messages: AnyEvent[] = [
        controllerMidiEvent(0, ch, MIDIControlEvents.RESET_CONTROLLERS, 0x7f),
        ...resetTrackMIDIEvents(ch),
      ]
      messages.forEach((e) => this.sendEvent(e))
    }
    this.stop()
    this.position = 0
  }

  /*
   to restore synthesizer state (e.g. pitch bend)
   collect all previous state events
   and send them to the synthesizer
  */
  sendCurrentStateEvents() {
    this.song.tracks
      .flatMap((t) => {
        const statusEvents = getStatusEvents(t.events, this._currentTick)
        this.applyPlayerEvents(statusEvents as PlayerEvent[])
        return convertTrackEvents(statusEvents, t.channel)
      })
      .forEach((e) => this.sendEvent(e))
  }

  get currentTempo() {
    return this._currentTempo
  }

  set currentTempo(value: number) {
    this._currentTempo = value
  }

  playNote({
    channel,
    noteNumber,
    velocity,
    duration,
  }: Pick<NoteEvent, "noteNumber" | "velocity" | "duration"> & {
    channel: number
  }) {
    this.sendEvent(noteOnMidiEvent(0, channel, noteNumber, velocity))
    this.sendEvent(
      noteOffMidiEvent(0, channel, noteNumber, 0),
      this.tickToMillisec(duration) / 1000
    )
  }

  private postSynthMessage(e: SynthEvent, transfer?: Transferable[]) {
    this.synth?.port.postMessage(e, transfer ?? [])
  }

  tickToMillisec(tick: number) {
    return (tick / (this.timebase / 60) / this._currentTempo) * 1000
  }

  private _shouldPlayChannel(channel: number) {
    const trackId = this.song.trackIdOfChannel(channel)
    return trackId ? this._trackMute.shouldPlayTrack(trackId) : true
  }

  sendEvent(event: SendableEvent, delayTime: number = 0) {
    const ev = anyEventToSynthEvent(event, delayTime * this.context.sampleRate)
    if (ev !== null) {
      this.postSynthMessage(ev)
    }
  }

  private syncPosition = throttle(() => {
    if (this._scheduler !== null) {
      this._currentTick = this._scheduler.currentTick
    }
  }, 50)

  private applyPlayerEvents(events: PlayerEvent[]) {
    events.forEach((e) => {
      if (e.type !== "channel" && "subtype" in e) {
        switch (e.subtype) {
          case "setTempo":
            this._currentTempo = 60000000 / e.microsecondsPerBeat
            break
          default:
            break
        }
      }
    })
  }

  private _onTimer(timestamp: number) {
    if (this._scheduler === null) {
      return
    }

    const events = this._scheduler.readNextEvents(this._currentTempo, timestamp)

    // channel イベントを MIDI Output に送信
    // Send Channel Event to MIDI OUTPUT
    events
      .filter(
        ({ event: e }) =>
          e.type === "channel" && this._shouldPlayChannel(e.channel)
      )
      .forEach(({ event: e, timestamp: time }) => {
        const delayTime = (time - timestamp) / 1000
        this.sendEvent(e, delayTime)
      })

    // channel イベント以外を実行
    // Run other than Channel Event
    this.applyPlayerEvents(events.map(({ event }) => event))

    if (this._scheduler.currentTick >= this.song.endOfSong) {
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

type SendableEvent = DistributiveOmit<AnyEvent, "deltaTime">

const anyEventToSynthEvent = (
  e: SendableEvent,
  delayTime: number
): SynthEvent | null => {
  switch (e.type) {
    case "channel":
      switch (e.subtype) {
        case "noteOn":
          return {
            type: "noteOn",
            channel: e.channel,
            pitch: e.noteNumber,
            velocity: e.velocity,
            delayTime,
          }
        case "noteOff":
          return {
            type: "noteOff",
            channel: e.channel,
            pitch: e.noteNumber,
            delayTime,
          }
        case "pitchBend":
          return {
            type: "pitchBend",
            channel: e.channel,
            value: e.value,
            delayTime,
          }
        case "programChange":
          return {
            type: "programChange",
            channel: e.channel,
            value: e.value,
            delayTime,
          }
        case "controller":
          switch (e.controllerType) {
            case 0:
              break
          }
          break
      }
  }
  return null
}
