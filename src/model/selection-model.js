import _ from "lodash"

export default class SelectionModel {
  constructor(fromTick, fromNoteNumber, toTick, toNoteNumber, notes = [], original = null) {
    this._fromTick = fromTick
    this._fromNoteNumber = fromNoteNumber
    this._toTick = toTick
    this._toNoteNumber = toNoteNumber
    this._notes = _.cloneDeep(notes)
    this._original = original
  }

  get fromTick() {
    return this._fromTick
  }

  get fromNoteNumber() {
    return this._fromNoteNumber
  }

  get toTick() {
    return this._toTick
  }

  get toNoteNumber() {
    return this._toNoteNumber
  }

  get noteIds() {
    return this._notes.map(n => n.id)
  }

  get notes() {
    return this._notes
  }

  get original() {
    return this._original || this
  }

  copyUpdated(notes) {
    return new SelectionModel(
      this.fromTick,
      this.fromNoteNumber,
      this.toTick,
      this.toNoteNumber,
      notes
    )
  }

  copyMoved(dt, dn = 0, dd = 0) {
    const s = this.original
    return new SelectionModel(
      s.fromTick + dt,
      s.fromNoteNumber + dn,
      s.toTick + dt + dd,
      s.toNoteNumber + dn,
      s.notes,
      s
    )
  }

  getBounds(transform) {
    const left = transform.getX(this.fromTick)
    const right = transform.getX(this.toTick)
    const top = transform.getY(this.fromNoteNumber)
    const bottom = transform.getY(this.toNoteNumber)
    return {
      x: left,
      y: top,
      width: right - left,
      height: bottom - top
    }
  }

  static fromRect(rect, quantizer, transform, notes = []) {
    return new SelectionModel(
      quantizer.round(transform.getTicks(rect.x)), 
      Math.ceil(transform.getNoteNumber(rect.y)), 
      quantizer.round(transform.getTicks(rect.x + rect.width)), 
      Math.ceil(transform.getNoteNumber(rect.y + rect.height)),
      notes
    )
  }
}
