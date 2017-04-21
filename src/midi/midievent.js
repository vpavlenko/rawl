export class MidiEvent {
  constructor(deltaTime, type) {
    this.deltaTime = deltaTime
    this.type = type
  }
}

export class MetaMidiEvent extends MidiEvent {
  constructor(deltaTime, subtype, value) {
    super(deltaTime, "meta")
    this.subtype = subtype
    this.value = value
  }
}

export class EndOfTrackMidiEvent extends MetaMidiEvent {
  constructor(deltaTime) {
    super(deltaTime, "endOfTrack")
  }
}

export class PortPrefixMidiEvent extends MetaMidiEvent {
  constructor(deltaTime, value) {
    super(deltaTime, "portPrefix", value)
  }
}

export class TextMetaMidiEvent extends MetaMidiEvent {
  static fromStream(deltaTime, subtype, stream, length) {
    return new TextMetaMidiEvent(deltaTime, subtype, stream.read(length))
  }

  get text() {
    return this.value
  }
}

export class TrackNameMidiEvent extends TextMetaMidiEvent {
  constructor(deltaTime, text) {
    super(deltaTime, "trackName", text)
  }
}

export class ByteMetaMidiEvent extends MetaMidiEvent {
  static fromStream(deltaTime, subtype, stream, length) {
    return new ByteMetaMidiEvent(deltaTime, subtype, stream.read(length))
  }
}

export class Int16MetaMidiEvent extends MetaMidiEvent {
  static fromStream(deltaTime, subtype, stream) {
    return new Int16MetaMidiEvent(deltaTime, subtype, stream.readInt16())
  }
}

export class Int8MetaMidiEvent extends MetaMidiEvent {
  static fromStream(deltaTime, subtype, stream) {
    return new Int8MetaMidiEvent(deltaTime, subtype, stream.readInt8())
  }
}

// from bpm: new SetTempoMidiEvent(t, 60000000 / bpm)
export class SetTempoMidiEvent extends MetaMidiEvent {
  constructor(deltaTime, microsecondsPerBeat) {
    super(deltaTime, "setTempo", microsecondsPerBeat)
  }

  get bpm() {
    return 60 * 1000000 / this.value
  }

  set bpm(value) {
    this.value = value / (60 * 1000000)
  }

  get microsecondsPerBeat() {
    return this.value
  }

  static fromStream(deltaTime, stream) {
    return new SetTempoMidiEvent(deltaTime,
      (stream.readInt8() << 16) +
      (stream.readInt8() << 8) +
      stream.readInt8()
    )
  }
}

export class TimeSignatureMidiEvent extends MetaMidiEvent {
  constructor(deltaTime, numerator, denominator, metronome, thirtyseconds = 8) {
    super(deltaTime, "timeSignature", `${numerator}/${denominator}`)
    this.numerator = numerator
    this.denominator = denominator
    this.metronome = metronome
    this.thirtyseconds = thirtyseconds
  }

  static fromStream(deltaTime, stream) {
    return new TimeSignatureMidiEvent(deltaTime,
      stream.readInt8(),
      Math.pow(2, stream.readInt8()),
      stream.readInt8(),
      stream.readInt8())
  }
}

// channel events

export class ChannelMidiEvent extends MidiEvent {
  constructor(deltaTime, subtype, value) {
    super(deltaTime, "channel")
    this.subtype = subtype
    this.value = value
  }
}

export class PitchBendMidiEvent extends ChannelMidiEvent {
  constructor(deltaTime, value) {
    super(deltaTime, "pitchBend", value)
  }
}

export class ProgramChangeMidiEvent extends ChannelMidiEvent {
  constructor(deltaTime, value) {
    super(deltaTime, "programChange", value)
  }
}

// controller events

export class ControllerMidiEvent extends ChannelMidiEvent {
  constructor(deltaTime, controllerType, value) {
    super(deltaTime, "controller", value)
    this.controllerType = controllerType
  }
}

export class ModulationMidiEvent extends ControllerMidiEvent {
  constructor(deltaTime, value) {
    super(deltaTime, 0x01, value)
  }
}

export class VolumeMidiEvent extends ControllerMidiEvent {
  constructor(deltaTime, value) {
    super(deltaTime, 0x07, value)
  }
}

export class PanMidiEvent extends ControllerMidiEvent {
  constructor(deltaTime, value) {
    super(deltaTime, 0x0a, value)
  }
}

export class ExpressionMidiEvent extends ControllerMidiEvent {
  constructor(deltaTime, value) {
    super(deltaTime, 0x0b, value)
  }
}
