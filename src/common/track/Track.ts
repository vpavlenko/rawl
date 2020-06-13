import { observable, action, transaction } from "mobx"
import { serializable, list, primitive } from "serializr"
import _ from "lodash"
import { AnyEvent } from "midifile-ts"

import { getInstrumentName } from "midi/GM"
import {
  TrackEvent,
  TrackEventRequired,
  TrackMidiEvent,
  NoteEvent,
} from "./TrackEvent"
import { isNotUndefined } from "../helpers/array"
import {
  isTrackNameEvent,
  isProgramChangeEvent,
  isEndOfTrackEvent,
  isSetTempoEvent,
  isControllerEvent,
} from "./identify"

type EventBeforeAdded = TrackMidiEvent | Omit<NoteEvent, "id">

export default class Track {
  @serializable(list(primitive()))
  @observable.shallow
  events: TrackEvent[] = []

  @serializable
  @observable
  lastEventId = 0

  @serializable
  @observable
  channel: number | undefined = undefined

  getEventById = (id: number) => _.find(this.events, (e) => e.id === id)

  private _updateEvent(
    id: number,
    obj: Partial<TrackEvent>
  ): TrackEvent | null {
    const anObj = this.getEventById(id)
    if (!anObj) {
      console.warn(`unknown id: ${id}`)
      return null
    }
    const newObj = Object.assign({}, anObj, obj)
    if (_.isEqual(newObj, anObj)) {
      return null
    }
    Object.assign(anObj, obj)
    return anObj
  }

  @action updateEvent(id: number, obj: Partial<TrackEvent>): TrackEvent | null {
    const result = this._updateEvent(id, obj)
    if (result) {
      this.updateEndOfTrack()
      this.sortByTick()
    }
    return result
  }

  @action updateEvents(events: Partial<TrackEvent>[]) {
    transaction(() => {
      events.forEach((event) => {
        if (event.id === undefined) {
          return
        }
        this._updateEvent(event.id, event)
      })
    })
    this.updateEndOfTrack()
    this.sortByTick()
  }

  @action removeEvent(id: number) {
    const obj = this.getEventById(id)
    if (obj == undefined) {
      return
    }
    this.events = _.without(this.events, obj)
    this.updateEndOfTrack()
  }

  @action removeEvents(ids: number[]) {
    const objs = ids.map((id) => this.getEventById(id)).filter(isNotUndefined)
    this.events = _.difference(this.events, objs)
    this.updateEndOfTrack()
  }

  // ソート、通知を行わない内部用の addEvent
  private _addEvent(e: EventBeforeAdded): TrackEvent {
    if (!("tick" in e) || isNaN(e.tick)) {
      throw new Error("invalid event is added")
    }
    const newEvent = {
      ...e,
      id: this.lastEventId++,
    } as TrackEvent
    this.events.push(newEvent)
    return newEvent
  }

  @action addEvent<T extends EventBeforeAdded>(e: T): TrackEvent {
    const ev = this._addEvent(e)
    this.didAddEvent()
    return ev
  }

  @action addEvents(events: EventBeforeAdded[]): TrackEvent[] {
    let result: TrackEvent[] = []
    transaction(() => {
      result = events.map((e) => this._addEvent(e))
    })
    this.didAddEvent()
    return result
  }

  didAddEvent() {
    this.updateEndOfTrack()
    this.sortByTick()
  }

  @action sortByTick() {
    this.events = _.sortBy(this.events, "tick")
  }

  @action updateEndOfTrack() {
    const tick = _.chain(this.events)
      .map((e) => e.tick + ("duration" in e ? e.duration : 0))
      .max()
      .value()
    this.setEndOfTrack(tick)
  }

  transaction(func: (track: Track) => void) {
    transaction(() => func(this))
  }

  /* helper */

  private _findControllerEvents(controllerType: number) {
    return this.events
      .filter(isControllerEvent)
      .filter((t) => t.controllerType === controllerType)
  }

  private _findVolumeEvents() {
    return this._findControllerEvents(7)
  }

  private _findPanEvents() {
    return this._findControllerEvents(10)
  }

  private _updateLast<T extends AnyEvent | TrackEventRequired>(
    arr: TrackEvent[],
    obj: Partial<T>
  ) {
    const last = _.last(arr)
    if (last !== undefined) {
      this.updateEvent(last.id, obj)
    }
  }

  createOrUpdate(newEvent: Partial<TrackEvent>) {
    const events = this.events.filter(
      (e) =>
        e.type === newEvent.type &&
        e.tick === newEvent.tick &&
        ("subtype" in e && "subtype" in newEvent
          ? e.subtype === newEvent.subtype
          : true)
    )

    if (events.length > 0) {
      this.transaction((it) => {
        events.forEach((e) => {
          it.updateEvent(e.id, { ...newEvent, id: e.id })
        })
      })
      return events[0]
    } else {
      return this.addEvent(newEvent as EventBeforeAdded)
    }
  }

  // 表示用の名前 トラック名がなければトラック番号を表示する
  get displayName() {
    if (this.name && this.name.length > 0) {
      return this.name
    }
    return `Track ${this.channel}`
  }

  get instrumentName() {
    if (this.isRhythmTrack) {
      return "Standard Drum Kit"
    }
    const program = this.programNumber
    if (program !== undefined) {
      return getInstrumentName(program)
    }
    return undefined
  }

  get name(): string | undefined {
    return _.get(_.last(this.events.filter(isTrackNameEvent)), "text")
  }

  setName(text: string) {
    this._updateLast(this.events.filter(isTrackNameEvent), { text })
  }

  get volume(): number | undefined {
    return _.get(_.last(this._findVolumeEvents()), "value")
  }

  setVolume(value: number) {
    this._updateLast(this._findVolumeEvents(), { value })
  }

  get pan(): number | undefined {
    return _.get(_.last(this._findPanEvents()), "value")
  }

  setPan(value: number) {
    this._updateLast(this._findPanEvents(), { value })
  }

  get endOfTrack(): number | undefined {
    return _.get(_.last(this.events.filter(isEndOfTrackEvent)), "tick")
  }

  setEndOfTrack(tick: number) {
    this._updateLast(this.events.filter(isEndOfTrackEvent), { tick })
  }

  get programNumber(): number | undefined {
    return _.get(_.last(this.events.filter(isProgramChangeEvent)), "value")
  }

  setProgramNumber(value: number) {
    this._updateLast(this.events.filter(isProgramChangeEvent), { value })
  }

  get tempo(): number | undefined {
    const e = _.last(this.events.filter(isSetTempoEvent))
    if (e === undefined) {
      return undefined
    }
    return 60000000 / e.microsecondsPerBeat
  }

  setTempo(bpm: number) {
    const microsecondsPerBeat = 60000000 / bpm
    this._updateLast(this.events.filter(isSetTempoEvent), {
      microsecondsPerBeat,
    })
  }

  get isConductorTrack() {
    return this.channel === undefined
  }

  get isRhythmTrack() {
    return this.channel === 9
  }
}
