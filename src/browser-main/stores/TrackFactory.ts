import Track from "./Track"
import { toTrackEvents } from "helpers/eventAssembler"

import {
  trackNameMidiEvent, endOfTrackMidiEvent,
  timeSignatureMidiEvent, setTempoMidiEvent,
  pitchBendMidiEvent, volumeMidiEvent,
  panMidiEvent, expressionMidiEvent,
  modulationMidiEvent, programChangeMidiEvent,
  resetAllMidiEvent,
  masterCoarceTuningEvents,
  masterFineTuningEvents,
  pitchbendSensitivityEvents,
} from "midi/MidiEvent"

export function conductorTrack(name = "Conductor Track") {
  const track = new Track()
  track.addEvents([
    trackNameMidiEvent(0, name),
    timeSignatureMidiEvent(0),
    setTempoMidiEvent(0, 60000000 / 120),
    endOfTrackMidiEvent(0)
  ])
  return track
}

export function emptyTrack(channel: number) {
  if (!Number.isInteger(channel)) {
    throw new Error("channel is not integer")
  }
  const track = new Track()
  track.channel = channel
  const events = toTrackEvents([
    resetAllMidiEvent(1),
    trackNameMidiEvent(1, ""),
    panMidiEvent(1, 64),
    volumeMidiEvent(1, 100),
    expressionMidiEvent(1, 127),
    ...masterCoarceTuningEvents(1),
    ...masterFineTuningEvents(1),
    ...pitchbendSensitivityEvents(1, 12),
    pitchBendMidiEvent(1, 0x2000),
    modulationMidiEvent(1, 0),
    programChangeMidiEvent(1, 0),
    endOfTrackMidiEvent(1)
  ])
  track.addEvents(events)
  return track
}