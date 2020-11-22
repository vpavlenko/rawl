import difference from "lodash/difference"
import isEqual from "lodash/isEqual"
import sortBy from "lodash/sortBy"
import without from "lodash/without"
import { action, computed, makeObservable, observable, transaction } from "mobx"
import { createModelSchema, list, primitive } from "serializr"
import { isNotUndefined } from "../helpers/array"
import { pojo } from "../helpers/pojo"
import { getInstrumentName } from "../midi/GM"
import { isControllerEventWithType } from "./identify"
import {
  getEndOfTrackEvent,
  getLast,
  getPan,
  getProgramNumberEvent,
  getTempo,
  getTempoEvent,
  getTimeSignatureEvent,
  getTrackNameEvent,
  getVolume,
  isTickBefore,
} from "./selector"
import { NoteEvent, TrackEvent, TrackMidiEvent } from "./TrackEvent"

type EventBeforeAdded = TrackMidiEvent | Omit<NoteEvent, "id">

export default class Track {
  events: TrackEvent[] = []
  lastEventId = 0
  channel: number | undefined = undefined

  getEventById = (id: number) => this.events.find((e) => e.id === id)

  constructor() {
    makeObservable(this, {
      updateEvent: action,
      updateEvents: action,
      removeEvent: action,
      removeEvents: action,
      addEvent: action,
      addEvents: action,
      sortByTick: action,
      updateEndOfTrack: action,
      displayName: computed,
      instrumentName: computed,
      name: computed,
      endOfTrack: computed,
      programNumber: computed,
      isConductorTrack: computed,
      isRhythmTrack: computed,
      events: observable.shallow,
      lastEventId: observable,
      channel: observable,
    })
  }

  private _updateEvent(
    id: number,
    obj: Partial<TrackEvent>
  ): TrackEvent | null {
    const index = this.events.findIndex((e) => e.id === id)
    if (index < 0) {
      console.warn(`unknown id: ${id}`)
      return null
    }
    const anObj = this.events[index]
    const newObj = { ...anObj, ...obj }
    if (isEqual(newObj, anObj)) {
      return null
    }
    this.events[index] = newObj as TrackEvent
    return anObj
  }

  updateEvent(id: number, obj: Partial<TrackEvent>): TrackEvent | null {
    const result = this._updateEvent(id, obj)
    if (result) {
      this.updateEndOfTrack()
      this.sortByTick()
    }
    return result
  }

  updateEvents(events: Partial<TrackEvent>[]) {
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

  removeEvent(id: number) {
    const obj = this.getEventById(id)
    if (obj == undefined) {
      return
    }
    this.events = without(this.events, obj)
    this.updateEndOfTrack()
  }

  removeEvents(ids: number[]) {
    const objs = ids.map((id) => this.getEventById(id)).filter(isNotUndefined)
    this.events = difference(this.events, objs)
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

  addEvent<T extends EventBeforeAdded>(e: T): TrackEvent {
    const ev = this._addEvent(e)
    this.didAddEvent()
    return ev
  }

  addEvents(events: EventBeforeAdded[]): TrackEvent[] {
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

  sortByTick() {
    this.events = sortBy(this.events, "tick")
  }

  updateEndOfTrack() {
    const tick = Math.max(
      ...this.events.map((e) => e.tick + ("duration" in e ? e.duration : 0))
    )
    this.setEndOfTrack(tick)
  }

  transaction(func: (track: Track) => void) {
    transaction(() => func(this))
  }

  /* helper */

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

  private setControllerValue = (
    controllerType: number,
    tick: number,
    value: number
  ) => {
    const e = getLast(
      this.events
        .filter(isControllerEventWithType(controllerType))
        .filter(isTickBefore(tick))
    )
    if (e !== undefined) {
      this.updateEvent(e.id, {
        value,
      })
    } else {
      // If there are no controller events, we insert new event at the head of the track
      this.addEvent({
        type: "channel",
        subtype: "controller",
        controllerType,
        tick: 0,
        value,
      })
    }
  }

  get name() {
    return getTrackNameEvent(this.events)?.text
  }
  get programNumber() {
    return getProgramNumberEvent(this.events)?.value
  }
  get endOfTrack() {
    return getEndOfTrackEvent(this.events)?.tick
  }

  getPan = (tick: number) => getPan(this.events, tick)
  getVolume = (tick: number) => getVolume(this.events, tick)
  getTempo = (tick: number) => getTempo(this.events, tick)
  getTimeSignatureEvent = (tick: number) =>
    getTimeSignatureEvent(this.events, tick)

  setVolume = (value: number, tick: number) =>
    this.setControllerValue(7, tick, value)

  setPan = (value: number, tick: number) =>
    this.setControllerValue(10, tick, value)

  setEndOfTrack(tick: number) {
    const e = getEndOfTrackEvent(this.events)
    if (e !== undefined) {
      this.updateEvent(e.id, { tick })
    }
  }

  setProgramNumber(value: number) {
    const e = getProgramNumberEvent(this.events)
    if (e !== undefined) {
      this.updateEvent(e.id, { value })
    }
  }

  setTempo(bpm: number, tick: number) {
    const e = getTempoEvent(this.events, tick)
    if (e !== undefined) {
      this.updateEvent(e.id, {
        microsecondsPerBeat: 60000000 / bpm,
      })
    }
  }

  setName(text: string) {
    const e = getTrackNameEvent(this.events)
    if (e !== undefined) {
      this.updateEvent(e.id, { text })
    }
  }

  get isConductorTrack() {
    return this.channel === undefined
  }

  get isRhythmTrack() {
    return this.channel === 9
  }
}

createModelSchema(Track, {
  events: list(pojo),
  lastEventId: primitive(),
  channel: primitive(),
})
