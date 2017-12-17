export function MidiEvent(deltaTime, type) {
  return {
    deltaTime,
    type
  }
}

export function MetaMidiEvent(deltaTime, subtype, value) {
  return {
    ...MidiEvent(deltaTime, "meta"),
    subtype,
    value
  }
}

export function EndOfTrackMidiEvent(deltaTime) {
  return MetaMidiEvent(deltaTime, "endOfTrack")
}

export function PortPrefixMidiEvent(deltaTime, value) {
  return {
    ...MetaMidiEvent(deltaTime, "portPrefix", value),
    port: value
  }
}

export function TextMetaMidiEvent(deltaTime, subtype, value) {
  return {
    ...MetaMidiEvent(deltaTime, subtype, value),
    text: value
  }
}

export function TrackNameMidiEvent(deltaTime, text) {
  return TextMetaMidiEvent(deltaTime, "trackName", text)
}

// from bpm: SetTempoMidiEvent(t, 60000000 / bpm)
export function SetTempoMidiEvent(deltaTime, value) {
  return {
    ...MetaMidiEvent(deltaTime, "setTempo", value),
    microsecondsPerBeat: value
  }
}

export function TimeSignatureMidiEvent(deltaTime, numerator, denominator, metronome, thirtyseconds) {
  return {
    ...MetaMidiEvent(deltaTime, "timeSignature", `${numerator}/${denominator}`),
    numerator,
    denominator,
    metronome,
    thirtyseconds
  }
}

// channel events

export function ChannelMidiEvent(deltaTime, subtype, value) {
  return {
    ...MidiEvent(deltaTime, "channel"),
    subtype,
    value
  }
}

export function PitchBendMidiEvent(deltaTime, value) {
  return ChannelMidiEvent(deltaTime, "pitchBend", value)
}

export function ProgramChangeMidiEvent(deltaTime, value) {
  return ChannelMidiEvent(deltaTime, "programChange", value)
}

// controller events

export function ControllerMidiEvent(deltaTime, controllerType, value) {
  return {
    ...ChannelMidiEvent(deltaTime, "controller", value),
    controllerType
  }
}

export function ModulationMidiEvent(deltaTime, value) {
  return ControllerMidiEvent(deltaTime, 0x01, value)
}

export function VolumeMidiEvent(deltaTime, value) {
  return ControllerMidiEvent(deltaTime, 0x07, value)
}

export function PanMidiEvent(deltaTime, value) {
  return ControllerMidiEvent(deltaTime, 0x0a, value)
}

export function ExpressionMidiEvent(deltaTime, value) {
  return ControllerMidiEvent(deltaTime, 0x0b, value)
}

export function ResetAllMidiEvent(deltaTime) {
  return ControllerMidiEvent(deltaTime, 121, 0)
}
