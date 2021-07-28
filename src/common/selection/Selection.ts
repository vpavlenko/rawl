import cloneDeep from "lodash/cloneDeep"
import { MaxNoteNumber } from "../../main/Constants"
import { IRect } from "../geometry"
import { NoteCoordTransform } from "../transform"
import { clampNotePoint, NotePoint } from "../transform/NotePoint"

export interface Selection {
  noteIds: number[]
  from: NotePoint
  to: NotePoint
}

export const getSelectionBounds = (
  selection: Selection,
  transform: NoteCoordTransform
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

export const movedSelectionTo = (
  selection: Selection,
  tick: number,
  number: number
): Selection => {
  const s = cloneDeep(selection)

  const duration = selection.to.tick - selection.from.tick
  const width = selection.to.noteNumber - selection.from.noteNumber
  s.from.tick = tick
  s.to.tick = tick + duration
  s.from.noteNumber = number
  s.to.noteNumber = number + width

  return s
}

export const movedSelection = (
  selection: Selection,
  dt: number,
  dn: number
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
  toNoteNumber: number
): Selection => ({
  noteIds: [],
  from: {
    tick: Math.max(0, Math.min(fromTick, toTick)),
    noteNumber: Math.min(
      MaxNoteNumber,
      Math.max(0, Math.max(fromNoteNumber, toNoteNumber))
    ),
  },
  to: {
    tick: Math.max(fromTick, toTick),
    noteNumber: Math.min(
      MaxNoteNumber,
      Math.max(0, Math.min(fromNoteNumber, toNoteNumber))
    ),
  },
})

export const clampSelection = (selection: Selection): Selection => ({
  noteIds: selection.noteIds,
  from: clampNotePoint(selection.from),
  to: clampNotePoint(selection.to),
})
