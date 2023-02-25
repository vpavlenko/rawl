import { SequencerSpecificEvent } from "midifile-ts"
import { sequencerSpecificEvent } from "../midi/MidiEvent"
import { TrackEvent } from "./TrackEvent"

/**
 * Stores track color information, etc.
 * as sequencer-specific events referring to PreSonus StudioOne.
 *
 * The data part starts with the first 4 characters of Signal as a prefix.
 * The next 1 byte is the event type that defined as SignalEventType, and the rest is the data body of any size.
 */

// 'S' 'i' 'g' 'n'
const signalEventPrefix = "Sign".split("").map((c) => c.charCodeAt(0))

enum SignalEventType {
  preserved = 0,
  trackColor = 1,
}

export type SignalEvent<T extends string> = {
  id: number
  tick: number
  type: "channel"
  subtype: "signal"
  signalEventType: T
}

export interface TrackColor {
  red: number // 0 to 0xFF
  green: number // 0 to 0xFF
  blue: number // 0 to 0xFF
  alpha: number // 0 to 0xFF (0 is transparent)
}

export type SignalTrackColorEvent = SignalEvent<"trackColor"> & TrackColor

// 'S' 'i' 'g' 'n' 0x01 A B G R
export const signalTrackColor = (deltaTime: number, e: SignalTrackColorEvent) =>
  sequencerSpecificEvent(deltaTime, [
    ...signalEventPrefix,
    SignalEventType.trackColor,
    e.alpha,
    e.blue,
    e.green,
    e.red,
  ])

export type AnySignalEvent = SignalTrackColorEvent

export const isSignalEvent = (e: TrackEvent): e is AnySignalEvent =>
  "subtype" in e && e.subtype === "signal"

export const isSignalTrackColorEvent = (
  e: TrackEvent
): e is SignalTrackColorEvent =>
  isSignalEvent(e) && e.signalEventType === "trackColor"

export const mapToSignalEvent = <
  T extends Pick<SequencerSpecificEvent, "data">
>(
  e: T
): AnySignalEvent | T => {
  if (e.data.length <= 5 || e.data.slice(0, 4) !== signalEventPrefix) {
    return e
  }

  switch (e.data[4]) {
    case SignalEventType.trackColor:
      if (e.data.length !== 10) {
        return e
      }
      return {
        ...e,
        subtype: "signal",
        signalEventType: "trackColor",
        alpha: e.data[6],
        blue: e.data[7],
        green: e.data[8],
        red: e.data[9],
      }
    default:
      return e
  }
}
