class MidiEvent {
  constructor(deltaTime, type) {
    this.deltaTime = deltaTime
    this.type = type
  }
}

class MetaMidiEvent extends MidiEvent {
  constructor(deltaTime, subtype, value) {
    super(deltaTime, "meta")
    this.subtype = subtype
    this.value = value
  }
}

class EndOfTrackMidiEvent extends MetaMidiEvent {
  constructor(deltaTime) {
    super(deltaTime, "endOfTrack")
  }
}

class PortPrefixMidiEvent extends MetaMidiEvent {
  constructor(deltaTime, value) {
    super(deltaTime, "portPrefix", value)
  }
}

class TextMetaMidiEvent extends MetaMidiEvent {
  static fromStream(deltaTime, subtype, stream, length) {
    return new TextMetaMidiEvent(deltaTime, subtype, stream.read(length)) 
  }

  get text() {
    return this.value
  }
}

class TrackNameMidiEvent extends TextMetaMidiEvent {
  constructor(deltaTime, text) {
    super(deltaTime, "trackName", text)
  }
}

class ByteMetaMidiEvent extends MetaMidiEvent {
  static fromStream(deltaTime, subtype, stream, length) {
    return new ByteMetaMidiEvent(deltaTime, subtype, stream.read(length)) 
  }
}

class Int16MetaMidiEvent extends MetaMidiEvent {
  static fromStream(deltaTime, subtype, stream) {
    return new Int16MetaMidiEvent(deltaTime, subtype, stream.readInt16()) 
  }
}

class Int8MetaMidiEvent extends MetaMidiEvent {
  static fromStream(deltaTime, subtype, stream) {
    return new Int8MetaMidiEvent(deltaTime, subtype, stream.readInt8()) 
  }
}

class SetTempoMidiEvent extends MetaMidiEvent {
  constructor(deltaTime, value) {
    super(deltaTime, "setTempo", value)
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

class TimeSignatureMidiEvent extends MetaMidiEvent {
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

class ChannelMidiEvent extends MidiEvent {
  constructor(deltaTime, subtype, value) {
    super(deltaTime, "channel")
    this.subtype = subtype
    this.value = value
  }
}

class PitchBendMidiEvent extends ChannelMidiEvent {
  constructor(deltaTime, value) {
    super(deltaTime, "pitchBend", value)
  }
}

// controller events

class ControllerMidiEvent extends ChannelMidiEvent {
  constructor(deltaTime, controllerType, value) {
    super(deltaTime, "controller", value)
    this.controllerType = controllerType
  }
}

class ModulationMidiEvent extends ControllerMidiEvent {
  constructor(deltaTime, value) {
    super(deltaTime, 0x01, value)
  }
}

class VolumeMidiEvent extends ControllerMidiEvent {
  constructor(deltaTime, value) {
    super(deltaTime, 0x07, value)
  }
}

class PanMidiEvent extends ControllerMidiEvent {
  constructor(deltaTime, value) {
    super(deltaTime, 0x0a, value)
  }
}

class ExpressionMidiEvent extends ControllerMidiEvent {
  constructor(deltaTime, value) {
    super(deltaTime, 0x0b, value)
  }
}

export { 
  MidiEvent, MetaMidiEvent, EndOfTrackMidiEvent, 
  TextMetaMidiEvent, ByteMetaMidiEvent,
  Int16MetaMidiEvent, Int8MetaMidiEvent,
  TrackNameMidiEvent, PortPrefixMidiEvent,
  SetTempoMidiEvent, TimeSignatureMidiEvent,
  PitchBendMidiEvent, VolumeMidiEvent,
  PanMidiEvent, ExpressionMidiEvent,
  ModulationMidiEvent
}
