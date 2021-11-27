// abstraction layer for pitch-bend and controller events

import { controllerMidiEvent, pitchBendMidiEvent } from "../midi/MidiEvent"
import { isControllerEventWithType, isPitchBendEvent } from "../track"

export type ValueEventType =
  | { type: "pitchBend" }
  | { type: "controller"; controllerType: number }

export const createValueEvent = (t: ValueEventType) => (value: number) => {
  switch (t.type) {
    case "pitchBend":
      return pitchBendMidiEvent(0, 0, Math.round(value))
    case "controller":
      return controllerMidiEvent(0, 0, t.controllerType, Math.round(value))
  }
}

export const isValueEvent = (t: ValueEventType) => {
  switch (t.type) {
    case "pitchBend":
      return isPitchBendEvent
    case "controller":
      return isControllerEventWithType(t.controllerType)
  }
}
