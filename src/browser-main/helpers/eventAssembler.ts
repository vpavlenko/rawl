import _ from "lodash"
import { assemble as assembleNotes, deassemble as deassembleNote } from "./noteAssembler"
import { assemble as assembleRPN, deassemble as deassembleRPN } from "./RPNAssembler"

export function toTrackEvents(events) {
  return assembleNotes(assembleRPN(events))
}

export function toRawEvents(event) {
  const a = deassembleRPN(event)
  const b = a.map(deassembleNote)
  return _.flatten(b)
}
