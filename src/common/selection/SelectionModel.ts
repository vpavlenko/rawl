import { IRect } from "common/geometry"
import TempoCoordTransform from "transform/TempoCoordTransform"

export default class SelectionModel {
  noteIds = []
  fromTick = 0
  toTick = 0
  fromNoteNumber = 0
  toNoteNumber = 0
  enabled = false

  getBounds(transform: TempoCoordTransform) {
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

  moveTo(tick: number, number: number) {
    const s = this.clone()

    const duration = this.toTick - this.fromTick
    const width = this.toNoteNumber - this.fromNoteNumber
    s.fromTick = tick
    s.toTick = tick + duration
    s.fromNoteNumber = number
    s.toNoteNumber = number + width

    return s
  }

  move(dt: number, dn: number) {
    const s = this.clone()

    s.fromTick += dt
    s.toTick += dt
    s.fromNoteNumber += dn
    s.toNoteNumber += dn

    return s
  }

  resize(fromTick: number, fromNoteNumber: number, toTick: number, toNoteNumber: number) {
    const s = new SelectionModel()

    // to が右下になるようにする
    s.fromTick = Math.min(fromTick, toTick)
    s.toTick = Math.max(fromTick, toTick)
    s.fromNoteNumber = Math.max(fromNoteNumber, toNoteNumber)
    s.toNoteNumber = Math.min(fromNoteNumber, toNoteNumber)
    s.enabled = true

    return s
  }

  clone() {
    const s = new SelectionModel()
    s.noteIds = this.noteIds
    s.fromTick = this.fromTick
    s.toTick = this.toTick
    s.fromNoteNumber = this.fromNoteNumber
    s.toNoteNumber = this.toNoteNumber
    s.enabled = this.enabled
    return s
  }
}
