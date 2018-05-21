import _ from "lodash"
import { assemble as assembleNotes, deassemble as deassembleNote } from "./noteAssembler"
import { assemble as assembleRPN, deassemble as deassembleRPN } from "./RPNAssembler"
import { AnyEvent } from "midifile-ts"
import { TrackEvent } from "common/track"

export function toTrackEvents(events: AnyEvent[]): TrackEvent[] {
  return assembleNotes(assembleRPN(events))
}

export function toRawEvents(event: TrackEvent): AnyEvent[] {
  const a = deassembleRPN(event)
  const b = a.map(deassembleNote)
  return _.flatten(b)
}
