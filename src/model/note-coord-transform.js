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

  getPixelsPerTick() {
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

  equals(t) {
    return this.getPixelsPerKey() == t.getPixelsPerKey()
      && this.getPixelsPerTick() == t.getPixelsPerTick()
      && this.getMaxNoteNumber() == t.getMaxNoteNumber()
  }
}

// helper

function getNotesInRect(notes, rect, t) {
  const t1 = t.getTicks(rect.x)
  const n1 = t.getNoteNumber(rect.y)
  const t2 = t.getTicks(rect.x + rect.width)
  const n2 = t.getNoteNumber(rect.y + rect.height)
  return notes.filter(note => 
    note.tick >= t1 && note.tick < t2 &&
    note.noteNumber <= n1 && note.noteNumber > n2 
  )
}

function getNoteUnderPoint(notes, x, y, t) {
  const tick = t.getTicks(x)
  const n = Math.ceil(t.getNoteNumber(y))
  return _.find(notes, note => 
    note.noteNumber == n && note.tick <= tick && note.tick + note.duration >= tick
  )
}
