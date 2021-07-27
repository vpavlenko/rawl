import { MaxNoteNumber } from "../../main/Constants"

export interface NotePoint {
  tick: number
  noteNumber: number
}

export const zeroNotePoint: NotePoint = {
  tick: 0,
  noteNumber: 0,
}

export const clampNotePoint = (point: NotePoint): NotePoint => ({
  tick: Math.max(0, point.tick),
  noteNumber: Math.min(MaxNoteNumber, Math.max(0, point.noteNumber)),
})
