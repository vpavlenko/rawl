class Selection {
  constructor(fromTick, fromNoteNumber, toTick, toNoteNumber, noteIds) {
    this._fromTick = fromTick
    this._fromNoteNumber = fromNoteNumber
    this._toTick = toTick
    this._toNoteNumber = toNoteNumber
    this._noteIds = noteIds
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
    return this._noteIds
  }

  getMoved(dt, dn) {
    return new Selection(
      this.fromTick + dt,
      this.fromNoteNumber + dn,
      this.toTick + dt,
      this.toNoteNumber + dn,
      this.noteIds
    )
  }
}
