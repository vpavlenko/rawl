import { IPoint } from "../geometry"
import { NoteEvent } from "../track"
import { NotePoint } from "./NotePoint"

export default class NoteCoordTransform {
  private _pixelsPerTick: number
  private _pixelsPerKey: number
  private _maxNoteNumber: number

  constructor(
    pixelsPerTick: number,
    pixelsPerKey: number,
    maxNoteNumber: number,
  ) {
    this._pixelsPerTick = pixelsPerTick
    this._pixelsPerKey = pixelsPerKey
    this._maxNoteNumber = maxNoteNumber
  }

  // pixels

  getX(tick: number) {
    return tick * this._pixelsPerTick
  }

  getY(noteNumber: number) {
    return (this._maxNoteNumber - noteNumber) * this._pixelsPerKey
  }

  getDeltaY(deltaNoteNumber: number) {
    return -deltaNoteNumber * this._pixelsPerKey
  }

  get pixelsPerTick() {
    return this._pixelsPerTick
  }

  // ticks

  getTicks(pixels: number) {
    return pixels / this._pixelsPerTick
  }

  getNoteNumber(pixels: number) {
    return Math.ceil(this.getNoteNumberFractional(pixels))
  }

  getNoteNumberFractional(pixels: number) {
    return this._maxNoteNumber - pixels / this._pixelsPerKey
  }

  getDeltaNoteNumber(deltaPixels: number) {
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

  getRect(note: NoteEvent) {
    return {
      x: this.getX(note.tick),
      y: this.getY(note.noteNumber),
      width: this.getX(note.duration),
      height: this._pixelsPerKey,
    }
  }

  getDrumRect(note: NoteEvent) {
    return {
      x: this.getX(note.tick) - this._pixelsPerKey / 2,
      y: this.getY(note.noteNumber),
      width: this._pixelsPerKey,
      height: this._pixelsPerKey,
    }
  }

  getNotePoint(pos: IPoint): NotePoint {
    return {
      tick: this.getTicks(pos.x),
      noteNumber: this.getNoteNumber(pos.y),
    }
  }

  getNotePointFractional(pos: IPoint): NotePoint {
    return {
      tick: this.getTicks(pos.x),
      noteNumber: this.getNoteNumberFractional(pos.y),
    }
  }

  equals(t: NoteCoordTransform) {
    return (
      this.pixelsPerKey === t.pixelsPerKey &&
      this.pixelsPerTick === t.pixelsPerTick &&
      this.maxNoteNumber === t.maxNoteNumber
    )
  }
}
