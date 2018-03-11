export interface MidiEvent {
  deltaTime: number
  type: string
}

export interface MetaMidiEvent<T> extends MidiEvent {
  subtype: string
  value?: T
}

export interface ChannelMidiEvent extends MidiEvent {
  subtype: string
  value: number
}

export interface ControllerMidiEvent extends ChannelMidiEvent {
  controllerType: number
}

export interface TimeSignature {
  numerator: number
  denominator: number
  metronome: number
  thirtyseconds: number
}

/* factory */

export function midiEvent(deltaTime: number, type: string): MidiEvent {
  return {
    deltaTime,
    type
  }
}

export function metaMidiEvent<T>(deltaTime: number, subtype: string, value: T): MetaMidiEvent<T> {
  return {
    ...midiEvent(deltaTime, "meta"),
    subtype,
    value
  }
}

export function endOfTrackMidiEvent(deltaTime: number) {
  return metaMidiEvent(deltaTime, "endOfTrack", null)
}

export function portPrefixMidiEvent(deltaTime: number, value: number) {
  return metaMidiEvent(deltaTime, "portPrefix", value)
}

export function trackNameMidiEvent(deltaTime: number, text: string) {
  return metaMidiEvent(deltaTime, "trackName", text)
}

// from bpm: SetTempoMidiEvent(t, 60000000 / bpm)
export function setTempoMidiEvent(deltaTime: number, value: number) {
  return metaMidiEvent(deltaTime, "setTempo", value)
}

export function timeSignatureMidiEvent(deltaTime: number, numerator = 4, denominator = 4, metronome = 24, thirtyseconds = 8): MetaMidiEvent<TimeSignature> {
  return metaMidiEvent(deltaTime, "timeSignature", {
    numerator,
    denominator,
    metronome,
    thirtyseconds
  })
}

// channel events

export function channelMidiEvent(deltaTime: number, subtype: string, value: number): ChannelMidiEvent {
  return {
    ...midiEvent(deltaTime, "channel"),
    subtype,
    value
  }
}

export function pitchBendMidiEvent(deltaTime, value) {
  return channelMidiEvent(deltaTime, "pitchBend", value)
}

export function programChangeMidiEvent(deltaTime, value) {
  return channelMidiEvent(deltaTime, "programChange", value)
}

// controller events

export function controllerMidiEvent(deltaTime: number, controllerType: number, value: number): ControllerMidiEvent {
  return {
    ...channelMidiEvent(deltaTime, "controller", value),
    controllerType
  }
}

export function modulationMidiEvent(deltaTime, value) {
  return controllerMidiEvent(deltaTime, 0x01, value)
}

export function volumeMidiEvent(deltaTime, value) {
  return controllerMidiEvent(deltaTime, 0x07, value)
}

export function panMidiEvent(deltaTime, value) {
  return controllerMidiEvent(deltaTime, 0x0a, value)
}

export function expressionMidiEvent(deltaTime, value) {
  return controllerMidiEvent(deltaTime, 0x0b, value)
}

export function resetAllMidiEvent(deltaTime) {
  return controllerMidiEvent(deltaTime, 121, 0)
}

// Control Change

export function controlChangeEvents(deltaTime: number, rpnMsb: number, rpnLsb: number, dataMsb?: number, dataLsb?: number) {
  const rpn = [
    controllerMidiEvent(deltaTime, 101, rpnMsb),
    controllerMidiEvent(0, 100, rpnLsb)
  ]

  const data: ControllerMidiEvent[] = []
  if (dataMsb !== undefined) {
    data.push(controllerMidiEvent(0, 6, dataMsb))
  }
  if (dataLsb !== undefined) {
    data.push(controllerMidiEvent(0, 38, dataLsb))
  }

  return [...rpn, ...data]
}

// value: 0 - 24 (半音)
export function pitchbendSensitivityEvents(deltaTime, value = 2) {
  return controlChangeEvents(deltaTime, 0, 0, value)
}

// value: -8192 - 8191
export function masterFineTuningEvents(deltaTime, value = 0) {
  const s = value + 0x2000
  const m = Math.floor(s / 0x80)
  const l = s - m * 0x80
  return controlChangeEvents(deltaTime, 0, 1, m, l)
}

// value: -24 - 24
export function masterCoarceTuningEvents(deltaTime, value = 0) {
  return controlChangeEvents(deltaTime, 0, 2, value + 64)
}
