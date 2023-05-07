import { MIDIControlEventNames, MIDIControlEvents } from "midifile-ts"
import { FC } from "react"
import { Localized } from "../../../components/Localized"
import { ControlMode } from "../../stores/ControlStore"

export const ControlName: FC<{ mode: ControlMode }> = ({ mode }) => {
  switch (mode.type) {
    case "velocity":
      return <Localized default="Velocity">velocity</Localized>
    case "pitchBend":
      return <Localized default="Pitch Bend">pitch-bend</Localized>
    case "controller":
      switch (mode.controllerType) {
        case MIDIControlEvents.MSB_MAIN_VOLUME:
          return <Localized default="Volume">volume</Localized>
        case MIDIControlEvents.MSB_PAN:
          return <Localized default="Panpot">panpot</Localized>
        case MIDIControlEvents.MSB_EXPRESSION:
          return <Localized default="Expression">expression</Localized>
        case MIDIControlEvents.SUSTAIN:
          return <Localized default="Hold Pedal">hold-pedal</Localized>
        default:
          return (
            <>
              {MIDIControlEventNames[mode.controllerType] === "Undefined"
                ? `CC${mode.controllerType}`
                : MIDIControlEventNames[mode.controllerType]}
            </>
          )
      }
  }
}
