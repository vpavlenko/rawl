import { controllerTypeString } from "../../../common/helpers/noteNumberString"
import { TrackEvent } from "../../../common/track"

export type EventInputProp =
  | {
      type: "number"
      value: number
      minValue: number
      maxValue: number
    }
  | {
      type: "text"
      value: string
    }

export type EventValueUpdator = {
  update: (value: number | string) => any
}

// Abstraction Layer for manipulating TrackEvent on EventList
export type EventController = {
  name: string
  gate?: EventInputProp & EventValueUpdator
  value?: EventInputProp & EventValueUpdator
}

export function getEventController<T extends TrackEvent>(
  e: T,
): EventController {
  switch (e.type) {
    case "channel":
      switch (e.subtype) {
        case "controller":
          return {
            name:
              controllerTypeString(e.controllerType) ?? `CC${e.controllerType}`,
            value: {
              type: "number",
              value: e.value,
              minValue: 0,
              maxValue: 127,
              update: (value) => ({ value }),
            },
          }
        case "note":
          return {
            name: e.subtype,
            value: {
              type: "number",
              value: e.velocity,
              minValue: 0,
              maxValue: 127,
              update: (velocity) => ({ velocity }),
            },
            gate: {
              type: "number",
              value: e.duration,
              minValue: 0,
              maxValue: Infinity,
              update: (duration) => ({ duration }),
            },
          }
        case "programChange":
          return {
            name: e.subtype,
            value: {
              type: "number",
              value: e.value,
              minValue: 0,
              maxValue: 127,
              update: (value) => ({ value }),
            },
          }
        case "pitchBend":
          return {
            name: e.subtype,
            value: {
              type: "number",
              value: e.value,
              minValue: 0,
              maxValue: 16384,
              update: (value) => ({ value }),
            },
          }
        default:
          return { name: e.subtype }
      }
    case "meta":
      switch (e.subtype) {
        case "trackName":
          return {
            name: e.subtype,
            value: {
              type: "text",
              value: e.text,
              update: (text) => ({ text }),
            },
          }
        case "midiChannelPrefix":
          return {
            name: e.subtype,
            value: {
              type: "number",
              value: e.value,
              minValue: 0,
              maxValue: 127,
              update: (channel) => ({ channel }),
            },
          }
        default:
          return { name: e.subtype }
      }
    case "dividedSysEx":
    case "sysEx":
      return { name: e.type }
  }
}
