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

class TextMetaMidiEvent extends MetaMidiEvent {
	static fromStream(deltaTime, subtype, stream, length) {
		return new TextMetaMidiEvent(deltaTime, subtype, stream.read(length)) 
	}

	get text() {
		return this.value
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
	constructor(deltaTime, numerator, denominator, metronome, thirtyseconds) {
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

/*
class to parse the .mid file format
(depends on stream.js)
*/
function MidiFile(data) {
	function readChunk(stream) {
		const id = stream.read(4)
		const length = stream.readInt32()
		return {
			'id': id,
			'length': length,
			'data': stream.read(length)
		}
	}
	
	var lastEventTypeByte
	
	function readEvent(stream) {
		const deltaTime = stream.readVarInt()
		var eventTypeByte = stream.readInt8()
		if ((eventTypeByte & 0xf0) == 0xf0) {
			/* system / meta event */
			if (eventTypeByte == 0xff) {
				/* meta event */
				const type = 'meta'
				const subtypeByte = stream.readInt8()
				const length = stream.readVarInt()
				switch(subtypeByte) {
					case 0x00:
						if (length != 2) throw "Expected length for sequenceNumber event is 2, got " + length
						return Int16MetaMidiEvent.fromStream(deltaTime, "sequenceNumber", stream)
					case 0x01:
						return TextMetaMidiEvent.fromStream(deltaTime, "text", stream, length)
					case 0x02:
						return TextMetaMidiEvent.fromStream(deltaTime, "copyrightNotice", stream, length)
					case 0x03:
						return TextMetaMidiEvent.fromStream(deltaTime, "trackName", stream, length)
					case 0x04:
						return TextMetaMidiEvent.fromStream(deltaTime, "instrumentName", stream, length)
					case 0x05:
						return TextMetaMidiEvent.fromStream(deltaTime, "lyrics", stream, length)
					case 0x06:
						return TextMetaMidiEvent.fromStream(deltaTime, "marker", stream, length)
					case 0x07:
						return TextMetaMidiEvent.fromStream(deltaTime, "cuePoint", stream, length)
					case 0x20:
						if (length != 1) throw "Expected length for midiChannelPrefix event is 1, got " + length
						return Int8MetaMidiEvent.fromStream(deltaTime, "midiChannelPrefix", stream)
					case 0x2f:
						if (length != 0) throw "Expected length for endOfTrack event is 0, got " + length
						return new EndOfTrackMidiEvent()
					case 0x51:
						if (length != 3) throw "Expected length for setTempo event is 3, got " + length
						return SetTempoMidiEvent.fromStream(deltaTime, stream)
					case 0x54:
						if (length != 5) throw "Expected length for smpteOffset event is 5, got " + length
						const hourByte = stream.readInt8()
						return {
							deltaTime: deltaTime,
							type: type,
							subtype: "smpteOffset",
							frameRate: {0x00: 24, 0x20: 25, 0x40: 29, 0x60: 30}[hourByte & 0x60],
							hour: hourByte & 0x1f,
							min: stream.readInt8(),
							sec: stream.readInt8(),
							frame: stream.readInt8(),
							subframe: stream.readInt8()
						}
					case 0x58:
						if (length != 4) throw "Expected length for timeSignature event is 4, got " + length
						return TimeSignatureMidiEvent.fromStream(deltaTime, stream)
					case 0x59:
						if (length != 2) throw "Expected length for keySignature event is 2, got " + length
						return {
							deltaTime: deltaTime,
							type: type,
							subtype: "keySignature",
							key: stream.readInt8(true),
							scale: stream.readInt8()
						}
					case 0x7f:
						return ByteMetaMidiEvent.fromStream(deltaTime, "sequencerSpecific", stream, length)
					default:
						return ByteMetaMidiEvent.fromStream(deltaTime, "unknown", stream, length)
				}
			} else if (eventTypeByte == 0xf0) {
				const length = stream.readVarInt()
				return {
					deltaTime: deltaTime,
					type: "sysEx",
					data: stream.read(length)
				}
			} else if (eventTypeByte == 0xf7) {
				const length = stream.readVarInt()
				return {
					deltaTime: deltaTime,
					type: "dividedSysEx",
					data: stream.read(length)
				}
			} else {
				throw "Unrecognised MIDI event type byte: " + eventTypeByte
			}
		} else {
			/* channel event */
			var param1
			if ((eventTypeByte & 0x80) == 0) {
				/* running status - reuse lastEventTypeByte as the event type.
					eventTypeByte is actually the first parameter
				*/
				param1 = eventTypeByte
				eventTypeByte = lastEventTypeByte
			} else {
				param1 = stream.readInt8()
				lastEventTypeByte = eventTypeByte
			}
			var eventType = eventTypeByte >> 4
			const channel = eventTypeByte & 0x0f
			const type = "channel"
			switch (eventType) {
				case 0x08:
					return {
						deltaTime: deltaTime,
						type: type,
						channel: channel,
						subtype: 'noteOff',
						noteNumber: param1,
						velocity: stream.readInt8()
					}
				case 0x09:
					const velocity = stream.readInt8()
					return {
						deltaTime: deltaTime,
						type: type,
						channel: channel,
						subtype: velocity == 0 ? 'noteOff' : 'noteOn',
						noteNumber: param1,
						velocity: velocity
					}
				case 0x0a:
					return {
						deltaTime: deltaTime,
						type: type,
						channel: channel,
						subtype: 'noteAftertouch',
						noteNumber: param1,
						amount: stream.readInt8()
					}
				case 0x0b:
					return {
						deltaTime: deltaTime,
						type: type,
						channel: channel,
						subtype: 'controller',
						controllerType: param1,
						value: stream.readInt8()
					}
				case 0x0c:
					return {
						deltaTime: deltaTime,
						type: type,
						channel: channel,
						subtype: 'programChange',
						value: param1
					}
				case 0x0d:
					return {
						deltaTime: deltaTime,
						type: type,
						channel: channel,
						subtype: 'channelAftertouch',
						amount: param1
					}
				case 0x0e:
					return {
						deltaTime: deltaTime,
						type: type,
						channel: channel,
						subtype: 'pitchBend',
						value: param1 + (stream.readInt8() << 7)
					}
				default:
					return {
						deltaTime: deltaTime,
						type: type,
						channel: channel,
						subtype: 'unknown',
						value: stream.readInt8()
					}
			}
		}
	}
	
	const stream = Stream(data)
	const headerChunk = readChunk(stream)
	if (headerChunk.id != 'MThd' || headerChunk.length != 6) {
		throw "Bad .mid file - header not found"
	}
	const headerStream = Stream(headerChunk.data)
	const formatType = headerStream.readInt16()
	const trackCount = headerStream.readInt16()
	const timeDivision = headerStream.readInt16()
	
	if (timeDivision & 0x8000) {
		throw "Expressing time division in SMTPE frames is not supported yet"
	} else {
		ticksPerBeat = timeDivision
	}
	
	const header = {
		'formatType': formatType,
		'trackCount': trackCount,
		'ticksPerBeat': ticksPerBeat
	}
	const tracks = []
	for (var i = 0; i < header.trackCount; i++) {
		tracks[i] = []
		const trackChunk = readChunk(stream)
		if (trackChunk.id != 'MTrk') {
			throw "Unexpected chunk - expected MTrk, got "+ trackChunk.id
		}
		const trackStream = Stream(trackChunk.data)
		while (!trackStream.eof()) {
			const event = readEvent(trackStream)
			tracks[i].push(event)
		}
	}
	
	return {
		'header': header,
		'tracks': tracks
	}
}
