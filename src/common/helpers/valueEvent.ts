// abstraction layer for pitch-bend and controller events

import { controllerMidiEvent, pitchBendMidiEvent } from "../midi/MidiEvent"
import { isControllerEventWithType, isPitchBendEvent } from "../track"

export type ValueEventType =
  | { type: "pitchBend" }
  | { type: "controller"; controllerType: number }

export const createValueEvent = (t: ValueEventType, value: number) =>
  t.type === "controller"
    ? controllerMidiEvent(0, 0, t.controllerType, Math.round(value))
    : pitchBendMidiEvent(0, 0, Math.round(value))

export const isValueEvent = (t: ValueEventType) =>
  t.type === "controller"
    ? isControllerEventWithType(t.controllerType)
    : isPitchBendEvent
