import cloneDeep from "lodash/cloneDeep"
import { MaxNoteNumber } from "../../main/Constants"
import { IRect } from "../geometry"
import { NoteCoordTransform } from "../transform"
import { clampNotePoint, NotePoint } from "../transform/NotePoint"

export interface Selection {
  from: NotePoint
  to: NotePoint
}

export const getSelectionBounds = (
  selection: Selection,
  transform: NoteCoordTransform,
): IRect => {
  const left = transform.getX(selection.from.tick)
  const right = transform.getX(selection.to.tick)
  const top = transform.getY(selection.from.noteNumber)
  const bottom = transform.getY(selection.to.noteNumber)
  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  }
}

export const movedSelection = (
  selection: Selection,
  dt: number,
  dn: number,
): Selection => {
  const s = cloneDeep(selection)

  s.from.tick += dt
  s.to.tick += dt
  s.from.noteNumber += dn
  s.to.noteNumber += dn

  return s
}

// to が右下になるようにする
// to Make the lower right

export const regularizedSelection = (
  fromTick: number,
  fromNoteNumber: number,
  toTick: number,
  toNoteNumber: number,
): Selection => ({
  from: {
    tick: Math.max(0, Math.min(fromTick, toTick)),
    noteNumber: Math.min(
      MaxNoteNumber,
      Math.max(0, Math.max(fromNoteNumber, toNoteNumber)),
    ),
  },
  to: {
    tick: Math.max(fromTick, toTick),
    noteNumber: Math.min(
      MaxNoteNumber,
      Math.max(0, Math.min(fromNoteNumber, toNoteNumber)),
    ),
  },
})

export const clampSelection = (selection: Selection): Selection => ({
  from: clampNotePoint(selection.from),
  to: clampNotePoint(selection.to),
})
