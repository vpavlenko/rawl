import Track from "common/track"
import { toTrackEvents } from "common/helpers/toTrackEvents"

import {
  trackNameMidiEvent,
  endOfTrackMidiEvent,
  timeSignatureMidiEvent,
  setTempoMidiEvent,
  pitchBendMidiEvent,
  volumeMidiEvent,
  panMidiEvent,
  expressionMidiEvent,
  modulationMidiEvent,
  programChangeMidiEvent,
  resetAllMidiEvent,
  masterCoarceTuningEvents,
  masterFineTuningEvents,
  pitchbendSensitivityEvents,
} from "midi/MidiEvent"

export function conductorTrack(name = "Conductor Track") {
  const track = new Track()
  const events = toTrackEvents([
    trackNameMidiEvent(0, name),
    timeSignatureMidiEvent(0),
    setTempoMidiEvent(0, 60000000 / 120),
    endOfTrackMidiEvent(0),
  ])
  track.addEvents(events)
  return track
}

export const resetTrackMIDIEvents = (channel: number) => [
  resetAllMidiEvent(0, channel),
  trackNameMidiEvent(0, ""),
  panMidiEvent(0, channel, 64),
  volumeMidiEvent(0, channel, 100),
  expressionMidiEvent(0, channel, 127),
  ...masterCoarceTuningEvents(0, channel),
  ...masterFineTuningEvents(0, channel),
  ...pitchbendSensitivityEvents(0, channel, 12),
  pitchBendMidiEvent(0, channel, 0x2000),
  modulationMidiEvent(0, channel, 0),
  programChangeMidiEvent(0, channel, 0),
]

export function emptyTrack(channel: number) {
  if (!Number.isInteger(channel)) {
    throw new Error("channel is not integer")
  }
  const track = new Track()
  track.channel = channel
  const events = toTrackEvents([
    ...resetTrackMIDIEvents(channel),
    endOfTrackMidiEvent(1),
  ])
  track.addEvents(events)
  return track
}
