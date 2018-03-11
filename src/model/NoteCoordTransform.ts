import _ from "lodash"

export default class NoteCoordTransform {
  private _pixelsPerTick: number
  private _pixelsPerKey: number
  private _maxNoteNumber: number

  constructor(pixelsPerTick, pixelsPerKey, maxNoteNumber) {
    this._pixelsPerTick = pixelsPerTick
    this._pixelsPerKey = pixelsPerKey
    this._maxNoteNumber = maxNoteNumber
  }

  // pixels

  getX(tick) {
    return tick * this._pixelsPerTick
  }

  getY(noteNumber) {
    return (this._maxNoteNumber - noteNumber) * this._pixelsPerKey
  }

  getDeltaY(deltaNoteNumber) {
    return -deltaNoteNumber * this._pixelsPerKey
  }

  get pixelsPerTick() {
    return this._pixelsPerTick
  }

  // ticks

  getTicks(pixels) {
    return pixels / this._pixelsPerTick
  }

  getNoteNumber(pixels) {
    return this._maxNoteNumber - pixels / this._pixelsPerKey
  }

  getDeltaNoteNumber(deltaPixels) {
    return -deltaPixels / this._pixelsPerKey
  }

  get maxNoteNumber() {
    return this._maxNoteNumber
  }

  get numberOfKeys() {
    return this._maxNoteNumber + 1
  }

  get pixelsPerKey() {
    return this._pixelsPerKey
  }

  //

  getMaxY() {
    return (this._maxNoteNumber + 1) * this._pixelsPerKey
  }

  getRect(note) {
    return {
      x: this.getX(note.tick),
      y: this.getY(note.noteNumber),
      width: this.getX(note.duration),
      height: this._pixelsPerKey
    }
  }

  getNoteForRect(rect) {
    const obj = {}
    if (_.has(rect, "x")) {
      obj["tick"] = this.getTicks(rect.x)
    }
    if (_.has(rect, "y")) {
      obj["noteNumber"] = this.getNoteNumber(rect.y)
    }
    if (_.has(rect, "width")) {
      obj["duration"] = this.getTicks(rect.width)
    }
    return obj
  }

  equals(t) {
    return this.pixelsPerKey === t.pixelsPerKey
      && this.pixelsPerTick === t.pixelsPerTick
      && this.maxNoteNumber === t.maxNoteNumber
  }
}
