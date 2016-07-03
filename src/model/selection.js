class Selection {
  constructor(fromTick, fromNoteNumber, toTick, toNoteNumber, notes, original) {
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
    return new Selection(
      this.fromTick,
      this.fromNoteNumber,
      this.toTick,
      this.toNoteNumber,
      notes
    )
  }

  copyMoved(dt, dn = 0, dd = 0) {
    return new Selection(
      this.fromTick + dt,
      this.fromNoteNumber + dn,
      this.toTick + dt + dd,
      this.toNoteNumber + dn,
      this.notes,
      this.original
    )
  }
}
