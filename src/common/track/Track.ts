import { observable, action, transaction, computed } from "mobx"
import { list, map, primitive, serializable } from "serializr"
import _ from "lodash"
import { TrackNameEvent, SetTempoEvent, EndOfTrackEvent, ProgramChangeEvent, ControllerEvent, AnyEvent } from "midifile-ts"

import { getInstrumentName } from "midi/GM"

import orArrayOf from "helpers/orArrayOf"

export interface NoteEvent {
  type: "channel",
  subtype: "note"
  duration: number
}

interface TrackEventRequired {
  id: number
  tick: number
  type: string
}

export type TrackEvent = TrackEventRequired & (AnyEvent | NoteEvent)

function lastValue(arr, prop) {
  const last = _.last(arr)
  return last && last[prop]
}

export default class Track {
  @serializable @observable.shallow 
  events: TrackEvent[] = []
  
  @serializable @observable 
  lastEventId = 0

  @serializable @observable 
  channel: number|undefined = undefined

  getEventById = (id: number) => _.find(this.events, e => e.id === id)

  constructor(midiEvents: AnyEvent[] = []) {
    midiEvents.forEach(e => this.addMidiEvent(e))
  }

  private _updateEvent(id: number, obj: Partial<TrackEvent>) {
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

  @action updateEvent(id: number, obj: Partial<TrackEvent>) {
    const result = this._updateEvent(id, obj)
    if (result) {
      this.updateEndOfTrack()
      this.sortByTick()
    }
    return result
  }

  @action updateEvents(events: Partial<TrackEvent>[]) {
    transaction(() => {
      events.forEach(event => {
        this._updateEvent(event.id, event)
      })
    })
    this.updateEndOfTrack()
    this.sortByTick()
  }

  @action removeEvent(id: number) {
    const obj = this.getEventById(id)
    this.events = _.without(this.events, obj)
    this.updateEndOfTrack()
  }

  @action removeEvents(ids: number[]) {
    const objs = ids.map(id => this.getEventById(id))
    this.events = _.difference(this.events, objs)
    this.updateEndOfTrack()
  }

  private addMidiEvent(e: AnyEvent) {
    const lastEvent = this.getEventById(this.lastEventId)
    const tick = e.deltaTime + (lastEvent ? lastEvent.tick : 0)
    const event = {
      ...e,
      id: -1,
      tick
    }

    this._addEvent(event)
  }

  // ソート、通知を行わない内部用の addEvent
  private _addEvent(e: TrackEvent) {
    e.id = this.lastEventId
    this.lastEventId++
    this.events.push(e)
    return e
  }

  @action addEvent(e: TrackEvent) {
    this._addEvent(e)
    this.didAddEvent()
    return e
  }

  @action addEvents(events: TrackEvent[]) {
    let result
    transaction(() => {
      result = events.map(e => this._addEvent(e))
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
    this.endOfTrack = _.chain(this.events)
      .map(e => e.tick + ((e as any).duration || 0))
      .max()
      .value()
  }

  transaction(func: (track: Track) => void) {
    transaction(() => func(this))
  }

  /* helper */

  findEventsWithSubtype<T extends AnyEvent>(subtype: string): (T & TrackEventRequired)[] {
    return this.events.filter(t => (t as any).subtype === subtype) as (T & TrackEventRequired)[]
  }

  private _findTrackNameEvent() {
    return this.findEventsWithSubtype<TrackNameEvent>("trackName")
  }

  private _findProgramChangeEvents() {
    return this.findEventsWithSubtype<ProgramChangeEvent>("programChange")
  }

  private _findEndOfTrackEvents() {
    return this.findEventsWithSubtype<EndOfTrackEvent>("endOfTrack")
  }

  private _findSetTempoEvents() {
    return this.findEventsWithSubtype<SetTempoEvent>("setTempo")
  }

  private _findControllerEvents(controllerType: number): (TrackEventRequired & ControllerEvent)[] {
    return this.findEventsWithSubtype<ControllerEvent>("controller")
      .filter(t => t.controllerType === controllerType)
  }

  private _findVolumeEvents() {
    return this._findControllerEvents(7)
  }

  private _findPanEvents() {
    return this._findControllerEvents(10)
  }

  private _updateLast(arr: TrackEvent[], obj: Partial<TrackEvent>) {
    if (arr.length > 0) {
      this.updateEvent(_.last(arr).id, obj)
    }
  }

  createOrUpdate(newEvent: Partial<TrackEvent>) {
    const events = this.events.filter(e =>
      e.type === newEvent.type &&
      e.tick === newEvent.tick && 
      (e as any).subtype === (newEvent as any).subtype)

    if (events.length > 0) {
      this.transaction(it => {
        events.forEach(e => {
          it.updateEvent(e.id, { ...newEvent, id: e.id })
        })
      })
      return events[0]
    } else {
      return this.addEvent((newEvent as any))
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

  get name(): string {
    return lastValue(this._findTrackNameEvent(), "text")
  }

  set name(text: string) {
    this._updateLast(this._findTrackNameEvent(), { text })
  }

  get volume(): number {
    return lastValue(this._findVolumeEvents(), "value")
  }

  set volume(value: number) {
    this._updateLast(this._findVolumeEvents(), { value })
  }

  get pan(): number {
    return lastValue(this._findPanEvents(), "value")
  }

  set pan(value: number) {
    this._updateLast(this._findPanEvents(), { value })
  }

  get endOfTrack(): number {
    return lastValue(this._findEndOfTrackEvents(), "tick")
  }

  set endOfTrack(tick: number) {
    this._updateLast(this._findEndOfTrackEvents(), { tick })
  }

  get programNumber(): number {
    return lastValue(this._findProgramChangeEvents(), "value")
  }

  set programNumber(value: number) {
    this._updateLast(this._findProgramChangeEvents(), { value })
  }

  get tempo(): number {
    return 60000000 / lastValue(this._findSetTempoEvents(), "microsecondsPerBeat")
  }

  set tempo(bpm: number) {
    const microsecondsPerBeat = 60000000 / bpm
    this._updateLast(this._findSetTempoEvents(), { microsecondsPerBeat })
  }

  get isConductorTrack() {
    return this.channel === undefined
  }

  get isRhythmTrack() {
    return this.channel === 9
  }
}
