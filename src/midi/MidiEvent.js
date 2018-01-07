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

export function TimeSignatureMidiEvent(deltaTime, numerator = 4, denominator = 4, metronome = 24, thirtyseconds = 8) {
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

// Control Change

export function ControlChangeEvents(deltaTime, rpnMsb, rpnLsb, dataMsb = undefined, dataLsb = undefined) {
  const rpn = [
    ControllerMidiEvent(deltaTime, 101, rpnMsb),
    ControllerMidiEvent(0, 100, rpnLsb)
  ]

  const data = []
  if (dataMsb !== undefined) {
    data.push(ControllerMidiEvent(0, 6, dataMsb))
  }
  if (dataLsb !== undefined) {
    data.push(ControllerMidiEvent(0, 38, dataLsb))
  }

  return [...rpn, ...data]
}

// value: 0 - 24 (半音)
export function PitchbendSensitivityEvents(deltaTime, value = 2) {
  return ControlChangeEvents(deltaTime, 0, 0, value)
}

// value: -8192 - 8191
export function MasterFineTuningEvents(deltaTime, value = 0) {
  const s = value + 0x2000
  const m = Math.floor(s / 0x80)
  const l = s - m * 0x80
  return ControlChangeEvents(deltaTime, 0, 1, m, l)
}

// value: -24 - 24
export function MasterCoarceTuningEvents(deltaTime, value = 0) {
  return ControlChangeEvents(deltaTime, 0, 2, value + 64)
}
