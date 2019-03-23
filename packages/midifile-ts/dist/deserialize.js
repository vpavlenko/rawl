export default function deserialize(stream, lastEventTypeByte, setLastEventTypeByte) {
    var deltaTime = stream.readVarInt();
    var eventTypeByte = stream.readInt8();
    if ((eventTypeByte & 0xf0) === 0xf0) {
        /* system / meta event */
        if (eventTypeByte === 0xff) {
            /* meta event */
            var type = "meta";
            var subtypeByte = stream.readInt8();
            var length = stream.readVarInt();
            switch (subtypeByte) {
                case 0x00:
                    if (length !== 2)
                        throw new Error("Expected length for sequenceNumber event is 2, got " + length);
                    return {
                        deltaTime: deltaTime,
                        type: type,
                        subtype: "sequenceNumber",
                        number: stream.readInt16()
                    };
                case 0x01:
                    return {
                        deltaTime: deltaTime,
                        type: type,
                        subtype: "text",
                        text: stream.readStr(length)
                    };
                case 0x02:
                    return {
                        deltaTime: deltaTime,
                        type: type,
                        subtype: "copyrightNotice",
                        text: stream.readStr(length)
                    };
                case 0x03:
                    return {
                        deltaTime: deltaTime,
                        type: type,
                        subtype: "trackName",
                        text: stream.readStr(length)
                    };
                case 0x04:
                    return {
                        deltaTime: deltaTime,
                        type: type,
                        subtype: "instrumentName",
                        text: stream.readStr(length)
                    };
                case 0x05:
                    return {
                        deltaTime: deltaTime,
                        type: type,
                        subtype: "lyrics",
                        text: stream.readStr(length)
                    };
                case 0x06:
                    return {
                        deltaTime: deltaTime,
                        type: type,
                        subtype: "marker",
                        text: stream.readStr(length)
                    };
                case 0x07:
                    return {
                        deltaTime: deltaTime,
                        type: type,
                        subtype: "cuePoint",
                        text: stream.readStr(length)
                    };
                case 0x20:
                    if (length !== 1)
                        throw new Error("Expected length for midiChannelPrefix event is 1, got " + length);
                    return {
                        deltaTime: deltaTime,
                        type: type,
                        subtype: "midiChannelPrefix",
                        channel: stream.readInt8()
                    };
                case 0x21:
                    if (length !== 1)
                        throw new Error("Expected length for midiChannelPrefix event is 1, got " + length);
                    return {
                        deltaTime: deltaTime,
                        type: type,
                        subtype: "portPrefix",
                        port: stream.readInt8()
                    };
                case 0x2f:
                    if (length !== 0)
                        throw new Error("Expected length for endOfTrack event is 0, got " + length);
                    return {
                        deltaTime: deltaTime,
                        type: type,
                        subtype: "endOfTrack"
                    };
                case 0x51:
                    if (length !== 3)
                        throw new Error("Expected length for setTempo event is 3, got " + length);
                    return {
                        deltaTime: deltaTime,
                        type: type,
                        subtype: "setTempo",
                        microsecondsPerBeat: (stream.readInt8() << 16) +
                            (stream.readInt8() << 8) +
                            stream.readInt8()
                    };
                case 0x54: {
                    if (length !== 5)
                        throw new Error("Expected length for smpteOffset event is 5, got " + length);
                    var hourByte = stream.readInt8();
                    var table = {
                        0x00: 24,
                        0x20: 25,
                        0x40: 29,
                        0x60: 30
                    };
                    return {
                        deltaTime: deltaTime,
                        type: type,
                        subtype: "smpteOffset",
                        frameRate: table[hourByte & 0x60],
                        hour: hourByte & 0x1f,
                        min: stream.readInt8(),
                        sec: stream.readInt8(),
                        frame: stream.readInt8(),
                        subframe: stream.readInt8()
                    };
                }
                case 0x58:
                    if (length !== 4)
                        throw new Error("Expected length for timeSignature event is 4, got " + length);
                    return {
                        deltaTime: deltaTime,
                        type: type,
                        subtype: "timeSignature",
                        numerator: stream.readInt8(),
                        denominator: Math.pow(2, stream.readInt8()),
                        metronome: stream.readInt8(),
                        thirtyseconds: stream.readInt8()
                    };
                case 0x59:
                    if (length !== 2)
                        throw new Error("Expected length for keySignature event is 2, got " + length);
                    return {
                        deltaTime: deltaTime,
                        type: type,
                        subtype: "keySignature",
                        key: stream.readInt8(true),
                        scale: stream.readInt8()
                    };
                case 0x7f:
                    return {
                        deltaTime: deltaTime,
                        type: type,
                        subtype: "sequencerSpecific",
                        data: stream.read(length)
                    };
                default:
                    return {
                        deltaTime: deltaTime,
                        type: type,
                        subtype: "unknown",
                        data: stream.read(length)
                    };
            }
        }
        else if (eventTypeByte === 0xf0) {
            var length = stream.readVarInt();
            return {
                deltaTime: deltaTime,
                type: "sysEx",
                data: stream.read(length)
            };
        }
        else if (eventTypeByte === 0xf7) {
            var length = stream.readVarInt();
            return {
                deltaTime: deltaTime,
                type: "dividedSysEx",
                data: stream.read(length)
            };
        }
        else {
            throw new Error("Unrecognised MIDI event type byte: " + eventTypeByte);
        }
    }
    else {
        /* channel event */
        var param1 = void 0;
        if ((eventTypeByte & 0x80) === 0) {
            /* running status - reuse lastEventTypeByte as the event type.
              eventTypeByte is actually the first parameter
            */
            param1 = eventTypeByte;
            eventTypeByte = lastEventTypeByte;
        }
        else {
            param1 = stream.readInt8();
            setLastEventTypeByte(eventTypeByte);
        }
        var eventType = eventTypeByte >> 4;
        var channel = eventTypeByte & 0x0f;
        var type = "channel";
        switch (eventType) {
            case 0x08:
                return {
                    deltaTime: deltaTime,
                    type: type,
                    channel: channel,
                    subtype: "noteOff",
                    noteNumber: param1,
                    velocity: stream.readInt8()
                };
            case 0x09: {
                var velocity = stream.readInt8();
                return {
                    deltaTime: deltaTime,
                    type: type,
                    channel: channel,
                    subtype: velocity === 0 ? "noteOff" : "noteOn",
                    noteNumber: param1,
                    velocity: velocity
                };
            }
            case 0x0a:
                return {
                    deltaTime: deltaTime,
                    type: type,
                    channel: channel,
                    subtype: "noteAftertouch",
                    noteNumber: param1,
                    amount: stream.readInt8()
                };
            case 0x0b:
                return {
                    deltaTime: deltaTime,
                    type: type,
                    channel: channel,
                    subtype: "controller",
                    controllerType: param1,
                    value: stream.readInt8()
                };
            case 0x0c:
                return {
                    deltaTime: deltaTime,
                    type: type,
                    channel: channel,
                    subtype: "programChange",
                    value: param1
                };
            case 0x0d:
                return {
                    deltaTime: deltaTime,
                    type: type,
                    channel: channel,
                    subtype: "channelAftertouch",
                    amount: param1
                };
            case 0x0e:
                return {
                    deltaTime: deltaTime,
                    type: type,
                    channel: channel,
                    subtype: "pitchBend",
                    value: param1 + (stream.readInt8() << 7)
                };
            default:
                return {
                    deltaTime: deltaTime,
                    type: type,
                    channel: channel,
                    subtype: "unknown",
                    data: stream.readInt8()
                };
        }
    }
}
//# sourceMappingURL=deserialize.js.map