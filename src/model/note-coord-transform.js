"use strict"

class NoteCoordTransform {
  constructor(pixelsPerTick, pixelsPerKey, maxNoteNumber) {
    this._pixelsPerTick = pixelsPerTick
    this._pixelsPerKey = pixelsPerKey
    this._maxNoteNumber = maxNoteNumber - 3
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

  getMaxNoteNumber() {
    return this._maxNoteNumber
  }

  getPixelsPerKey() {
    return this._pixelsPerKey
  }

  // 

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
      obj["tick"] = this.getTicksForPixels(rect.x)
    }
    if (_.has(rect, "y")) {
      obj["noteNumber"] = this.getNoteNumberForPixels(rect.y)
    }
    if (_.has(rect, "width")) {
      obj["duration"] = this.getTicksForPixels(rect.width)
    }
    return obj
  }
}
