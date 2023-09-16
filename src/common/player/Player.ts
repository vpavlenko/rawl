import range from "lodash/range"
import throttle from "lodash/throttle"
import { AnyEvent, MIDIControlEvents } from "midifile-ts"
import { computed, makeObservable, observable } from "mobx"
import { SendableEvent, SynthOutput } from "../../main/services/SynthOutput"
import { SongStore } from "../../main/stores/SongStore"
import { filterEventsWithRange } from "../helpers/filterEvents"
import { Beat, createBeatsInRange } from "../helpers/mapBeats"
import {
  controllerMidiEvent,
  noteOffMidiEvent,
  noteOnMidiEvent,
} from "../midi/MidiEvent"
import { getStatusEvents } from "../track/selector"
import { ITrackMute } from "../trackMute/ITrackMute"
import { DistributiveOmit } from "../types"
import EventScheduler from "./EventScheduler"
import { convertTrackEvents, PlayerEvent } from "./PlayerEvent"

export interface LoopSetting {
  begin: number
  end: number
  enabled: boolean
}

const TIMER_INTERVAL = 50
const LOOK_AHEAD_TIME = 50
const METRONOME_TRACK_ID = 99999
export const DEFAULT_TEMPO = 120

export default class Player {
  private _currentTempo = DEFAULT_TEMPO
  private _scheduler: EventScheduler<PlayerEvent> | null = null
  private _songStore: SongStore
  private _output: SynthOutput
  private _metronomeOutput: SynthOutput
  private _trackMute: ITrackMute
  private _interval: number | null = null
  private _currentTick = 0
  private _isPlaying = false

  disableSeek: boolean = false
  isMetronomeEnabled: boolean = false

  loop: LoopSetting | null = null

  constructor(
    output: SynthOutput,
    metronomeOutput: SynthOutput,
    trackMute: ITrackMute,
    songStore: SongStore,
  ) {
    makeObservable<Player, "_currentTick" | "_isPlaying">(this, {
      _currentTick: observable,
      _isPlaying: observable,
      loop: observable,
      isMetronomeEnabled: observable,
      position: computed,
      isPlaying: computed,
    })

    this._output = output
    this._metronomeOutput = metronomeOutput
    this._trackMute = trackMute
    this._songStore = songStore
  }

  private get song() {
    return this._songStore.song
  }

  private get timebase() {
    return this.song.timebase
  }

  play() {
    if (this.isPlaying) {
      console.warn("called play() while playing. aborted.")
      return
    }
    this._scheduler = new EventScheduler<PlayerEvent>(
      (startTick, endTick) =>
        filterEventsWithRange(this.song.allEvents, startTick, endTick).concat(
          filterEventsWithRange(
            createBeatsInRange(
              this.song.measures,
              this.song.timebase,
              startTick,
              endTick,
            ).flatMap((b) => this.beatToEvents(b)),
            startTick,
            endTick,
          ),
        ),
      () => this.allNotesOffEvents(),
      this._currentTick,
      this.timebase,
      TIMER_INTERVAL + LOOK_AHEAD_TIME,
    )
    this._isPlaying = true
    this._output.activate()
    this._interval = window.setInterval(() => this._onTimer(), TIMER_INTERVAL)
    this._output.activate()
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
      controllerMidiEvent(0, ch, MIDIControlEvents.ALL_SOUNDS_OFF, 0),
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

  private allNotesOffEvents(): DistributiveOmit<PlayerEvent, "tick">[] {
    return range(0, this.numberOfChannels).map((ch) => ({
      ...controllerMidiEvent(0, ch, MIDIControlEvents.ALL_NOTES_OFF, 0),
      trackId: -1, // do not mute
    }))
  }

  private resetControllers() {
    for (const ch of range(0, this.numberOfChannels)) {
      this.sendEvent(
        controllerMidiEvent(0, ch, MIDIControlEvents.RESET_CONTROLLERS, 0x7f),
      )
    }
  }

  private beatToEvents(beat: Beat): PlayerEvent[] {
    const velocity = beat.beat === 0 ? 100 : 70
    const noteNumber = beat.beat === 0 ? 76 : 77
    return [
      {
        ...noteOnMidiEvent(0, 9, noteNumber, velocity),
        tick: beat.tick,
        trackId: METRONOME_TRACK_ID,
      },
    ]
  }

  stop() {
    this._scheduler = null
    this.allSoundsOff()
    this._isPlaying = false

    if (this._interval !== null) {
      clearInterval(this._interval)
      this._interval = null
    }
  }

  reset() {
    this.resetControllers()
    this.stop()
    this._currentTick = 0
  }

  /*
   to restore synthesizer state (e.g. pitch bend)
   collect all previous state events
   and send them to the synthesizer
  */
  sendCurrentStateEvents() {
    this.song.tracks
      .flatMap((t, i) => {
        const statusEvents = getStatusEvents(t.events, this._currentTick)
        statusEvents.forEach((e) => this.applyPlayerEvent(e))
        return convertTrackEvents(statusEvents, t.channel, i)
      })
      .forEach((e) => this.sendEvent(e))
  }

  get currentTempo() {
    return this._currentTempo
  }

  set currentTempo(value: number) {
    this._currentTempo = value
  }

  startNote(
    {
      channel,
      noteNumber,
      velocity,
    }: {
      noteNumber: number
      velocity: number
      channel: number
    },
    delayTime = 0,
  ) {
    this._output.activate()
    this.sendEvent(noteOnMidiEvent(0, channel, noteNumber, velocity), delayTime)
  }

  stopNote(
    {
      channel,
      noteNumber,
    }: {
      noteNumber: number
      channel: number
    },
    delayTime = 0,
  ) {
    this.sendEvent(noteOffMidiEvent(0, channel, noteNumber, 0), delayTime)
  }

  // delayTime: seconds, timestampNow: milliseconds
  sendEvent(
    event: SendableEvent,
    delayTime: number = 0,
    timestampNow: number = performance.now(),
  ) {
    this._output.sendEvent(event, delayTime, timestampNow)
  }

  private syncPosition = throttle(() => {
    if (this._scheduler !== null) {
      this._currentTick = this._scheduler.scheduledTick
    }
  }, 50)

  private applyPlayerEvent(
    e: DistributiveOmit<AnyEvent, "deltaTime" | "channel">,
  ) {
    if (e.type !== "channel" && "subtype" in e) {
      switch (e.subtype) {
        case "setTempo":
          this._currentTempo = 60000000 / e.microsecondsPerBeat
          break
        default:
          break
      }
    }
  }

  private _onTimer() {
    if (this._scheduler === null) {
      return
    }

    const timestamp = performance.now()

    this._scheduler.loop =
      this.loop !== null && this.loop.enabled ? this.loop : null
    const events = this._scheduler.readNextEvents(this._currentTempo, timestamp)

    events.forEach(({ event: e, timestamp: time }) => {
      if (e.type === "channel") {
        const delayTime = (time - timestamp) / 1000
        if (e.trackId === METRONOME_TRACK_ID) {
          if (this.isMetronomeEnabled) {
            this._metronomeOutput.sendEvent(e, delayTime, timestamp)
          }
        } else if (this._trackMute.shouldPlayTrack(e.trackId)) {
          // channel イベントを MIDI Output に送信
          // Send Channel Event to MIDI OUTPUT
          this.sendEvent(e, delayTime, timestamp)
        }
      } else {
        // channel イベント以外を実行
        // Run other than Channel Event
        this.applyPlayerEvent(e)
      }
    })

    if (this._scheduler.scheduledTick >= this.song.endOfSong) {
      this.stop()
    }

    this.syncPosition()
  }
}
