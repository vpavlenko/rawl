import observable from "riot-observable"
import _ from "lodash"
import Rect from "./Rect"

export default class SelectionModel {
  constructor() {
    this.reset()
    observable(this)
  }

  emitChanges() {
    this.trigger("change")
  }

  getBounds(transform) {
    const left = transform.getX(this.fromTick)
    const right = transform.getX(this.toTick)
    const top = transform.getY(this.fromNoteNumber)
    const bottom = transform.getY(this.toNoteNumber)
    return new Rect(
      left,
      top,
      right - left,
      bottom - top
    )
  }

  setNoteIds(noteIds) {
    this.noteIds = noteIds
    this.emitChanges()
  }

  moveTo(tick, number) {
    const duration = this.toTick - this.fromTick
    const width = this.toNoteNumber - this.fromNoteNumber
    this.fromTick = tick
    this.toTick = tick + duration
    this.fromNoteNumber = number
    this.toNoteNumber = number + width
    this.emitChanges()
  }

  move(dt, dn) {
    this.fromTick += dt
    this.toTick += dt
    this.fromNoteNumber += dn
    this.toNoteNumber += dn
    this.emitChanges()
  }

  resize(rect, quantizer, transform) {
    this.fromTick = quantizer.round(transform.getTicks(rect.x))
    this.fromNoteNumber = Math.ceil(transform.getNoteNumber(rect.y))
    this.toTick = quantizer.round(transform.getTicks(rect.x + rect.width))
    this.toNoteNumber = Math.ceil(transform.getNoteNumber(rect.y + rect.height))
    this.enabled = true
    this.emitChanges()
  }

  setFromTick(t) {
    this.fromTick = t
    this.emitChanges()
  }

  setToTick(t) {
    this.toTick = t
    this.emitChanges()
  }

  reset() {
    this.noteIds = []
    this.enabled = false
    this.fromTick = 0
    this.fromNoteNumber = 0
    this.toTick = 0
    this.toNoteNumber = 0
  }

  equals(s) {
    return s.fromTick === this.fromTick
      && s.toTick === this.toTick
      && s.fromNoteNumber === this.fromNoteNumber
      && s.toNoteNumber === this.toNoteNumber
      && s.enabled === this.enabled
      && _.isEqual(s.noteIds, this.noteIds)
  }
}
