'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/* Wrapper for accessing strings through sequential reads */
var Stream = /** @class */ (function () {
    function Stream(buf) {
        this.position = 0;
        this.buf = buf;
    }
    Stream.prototype.readByte = function () {
        var result = this.buf[this.position];
        this.position++;
        return result;
    };
    Stream.prototype.readStr = function (length) {
        return this.read(length).toString();
    };
    Stream.prototype.read = function (length) {
        var result = this.buf.slice(this.position, this.position + length);
        this.position += length;
        return result;
    };
    /* read a big-endian 32-bit integer */
    Stream.prototype.readInt32 = function () {
        var result = (this.readByte() << 24)
            + (this.readByte() << 16)
            + (this.readByte() << 8)
            + this.readByte();
        return result;
    };
    /* read a big-endian 16-bit integer */
    Stream.prototype.readInt16 = function () {
        var result = (this.readByte() << 8)
            + this.readByte();
        return result;
    };
    /* read an 8-bit integer */
    Stream.prototype.readInt8 = function (signed) {
        if (signed === void 0) { signed = false; }
        var result = this.readByte();
        if (signed && result > 127)
            result -= 256;
        return result;
    };
    Stream.prototype.eof = function () {
        return this.position >= this.buf.length;
    };
    /* read a MIDI-style variable-length integer
      (big-endian value in groups of 7 bits,
      with top bit set to signify that another byte follows)
    */
    Stream.prototype.readVarInt = function () {
        var result = 0;
        for (;;) {
            var b = this.readInt8();
            if (b & 0x80) {
                result += (b & 0x7f);
                result <<= 7;
            }
            else {
                /* b is the last byte */
                return result + b;
            }
        }
    };
    return Stream;
}());

function deserialize(stream, lastEventTypeByte, setLastEventTypeByte) {
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
                        microsecondsPerBeat: ((stream.readInt8() << 16)
                            + (stream.readInt8() << 8)
                            + stream.readInt8())
                    };
                case 0x54: {
                    if (length !== 5)
                        throw new Error("Expected length for smpteOffset event is 5, got " + length);
                    var hourByte = stream.readInt8();
                    return {
                        deltaTime: deltaTime,
                        type: type,
                        subtype: "smpteOffset",
                        frameRate: { 0x00: 24, 0x20: 25, 0x40: 29, 0x60: 30 }[hourByte & 0x60],
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

/*
class to parse the .mid file format
(depends on stream.js)
*/
function read(data) {
    function readChunk(stream) {
        var id = stream.readStr(4);
        var length = stream.readInt32();
        return {
            id: id,
            length: length,
            data: stream.read(length)
        };
    }
    var stream = new Stream(data);
    var headerChunk = readChunk(stream);
    if (headerChunk.id !== "MThd" || headerChunk.length !== 6) {
        throw new Error("Bad .mid file - header not found");
    }
    var headerStream = new Stream(headerChunk.data);
    var formatType = headerStream.readInt16();
    var trackCount = headerStream.readInt16();
    var timeDivision = headerStream.readInt16();
    var ticksPerBeat;
    if (timeDivision & 0x8000) {
        throw new Error("Expressing time division in SMTPE frames is not supported yet");
    }
    else {
        ticksPerBeat = timeDivision;
    }
    var header = {
        formatType: formatType,
        trackCount: trackCount,
        ticksPerBeat: ticksPerBeat
    };
    var lastEventTypeByte;
    function readEvent(stream) {
        return deserialize(stream, lastEventTypeByte, function (byte) { return lastEventTypeByte = byte; });
    }
    var tracks = [];
    for (var i = 0; i < header.trackCount; i++) {
        tracks[i] = [];
        var trackChunk = readChunk(stream);
        if (trackChunk.id !== "MTrk") {
            throw new Error("Unexpected chunk - expected MTrk, got " + trackChunk.id);
        }
        var trackStream = new Stream(trackChunk.data);
        while (!trackStream.eof()) {
            var event = readEvent(trackStream);
            tracks[i].push(event);
        }
    }
    return {
        header: header,
        tracks: tracks
    };
}

function toCharCodes(str) {
    var bytes = [];
    for (var i = 0; i < str.length; i++) {
        bytes.push(str.charCodeAt(i));
    }
    return bytes;
}

var Buffer = /** @class */ (function () {
    function Buffer() {
        this.data = [];
    }
    Object.defineProperty(Buffer.prototype, "length", {
        get: function () {
            return this.data.length;
        },
        enumerable: true,
        configurable: true
    });
    Buffer.prototype.writeByte = function (v, pos) {
        if (pos) {
            this.data[pos] = v;
        }
        else {
            this.data.push(v);
        }
    };
    Buffer.prototype.writeStr = function (str) {
        this.writeBytes(toCharCodes(str));
    };
    Buffer.prototype.writeInt32 = function (v, pos) {
        if (pos === void 0) { pos = 0; }
        this.writeByte((v >> 24) & 0xff, pos);
        this.writeByte((v >> 16) & 0xff, pos + 1);
        this.writeByte((v >> 8) & 0xff, pos + 2);
        this.writeByte(v & 0xff, pos + 3);
    };
    Buffer.prototype.writeInt16 = function (v, pos) {
        if (pos === void 0) { pos = 0; }
        this.writeByte((v >> 8) & 0xff, pos);
        this.writeByte(v & 0xff, pos + 1);
    };
    Buffer.prototype.writeBytes = function (arr) {
        var _this = this;
        arr.forEach(function (v) { return _this.writeByte(v); });
    };
    Buffer.prototype.writeChunk = function (id, func) {
        this.writeStr(id);
        var sizePos = this.length;
        this.writeInt32(0); // dummy chunk size
        var start = this.length;
        func(this); // write chunk contents
        var size = this.length - start;
        this.writeInt32(size, sizePos); // write chunk size
    };
    Buffer.prototype.toBytes = function () {
        return new Uint8Array(this.data);
    };
    return Buffer;
}());

// variable-length quantity
function toVLQ(intNum) {
    var v = intNum;
    var r = [v & 0x7f];
    while (true) {
        v >>= 7;
        if (v === 0) {
            break;
        }
        r.unshift(0x80 + (v & 0x7f));
    }
    return r;
}

var MIDIChannelEvents = {
    "noteOff": 0x08,
    "noteOn": 0x09,
    "noteAftertouch": 0x0a,
    "controller": 0x0b,
    "programChange": 0x0c,
    "channelAftertouch": 0x0d,
    "pitchBend": 0x0e,
};

var MIDIMetaEvents = {
    sequenceNumber: 0x00,
    text: 0x01,
    copyrightNotice: 0x02,
    trackName: 0x03,
    instrumentName: 0x04,
    lyrics: 0x05,
    marker: 0x06,
    cuePoint: 0x07,
    midiChannelPrefix: 0x20,
    portPrefix: 0x21,
    endOfTrack: 0x2f,
    setTempo: 0x51,
    smpteOffset: 0x54,
    timeSignature: 0x58,
    keySignature: 0x59,
    sequencerSpecific: 0x7f
};

function serialize(event, includeDeltaTime) {
    if (includeDeltaTime === void 0) { includeDeltaTime = true; }
    var bytes = [];
    function add(data) {
        if (data.forEach !== undefined) {
            data.forEach(add);
        }
        else {
            if (!Number.isInteger(data)) {
                throw new Error("\"" + data + "\" is not integer");
            }
            bytes.push(data);
        }
    }
    if (includeDeltaTime) {
        add(toVLQ(event.deltaTime));
    }
    function addNumbers(list) {
        add(list.length);
        list.forEach(function (v) { return add(v); });
    }
    function addText(text) {
        add(text.length);
        add(toCharCodes(text));
    }
    switch (event.type) {
        case "meta": {
            var e = event;
            var subtypeCode = MIDIMetaEvents[e.subtype];
            if (subtypeCode === undefined) {
                return [];
            }
            add(0xff); // type
            add(subtypeCode); // subtype
            switch (e.subtype) {
                case "text":
                    addText(e.text);
                    break;
                case "copyrightNotice":
                    addText(e.text);
                    break;
                case "trackName":
                    addText(e.text);
                    break;
                case "instrumentName":
                    addText(e.text);
                    break;
                case "lyrics":
                    addText(e.text);
                    break;
                case "cuePoint":
                    addText(e.text);
                    break;
                case "midiChannelPrefix":
                    addNumbers([e.channel]);
                    break;
                case "portPrefix":
                    addNumbers([e.port]);
                    break;
                case "endOfTrack":
                    add(0);
                    break;
                case "setTempo": {
                    var t = e.microsecondsPerBeat;
                    addNumbers([
                        (t >> 16) & 0xff,
                        (t >> 8) & 0xff,
                        t & 0xff
                    ]);
                    break;
                }
                case "timeSignature": {
                    var ev = e;
                    addNumbers([
                        ev.numerator,
                        Math.log2(ev.denominator),
                        ev.metronome,
                        ev.thirtyseconds
                    ]);
                    break;
                }
                case "keySignature": {
                    var ev = e;
                    addNumbers([
                        ev.key,
                        ev.scale
                    ]);
                    break;
                }
                case "sequencerSpecific":
                    addNumbers(e.data);
                    break;
                case "unknown":
                    addNumbers(e.data);
                    break;
                default:
                    break;
            }
            break;
        }
        case "sysEx":
            add(0xf0);
            addNumbers(event.data);
            break;
        case "dividedSysEx":
            add(0xf7);
            addNumbers(event.data);
            break;
        case "channel": {
            var e = event;
            var subtypeCode = MIDIChannelEvents[e.subtype];
            if (subtypeCode === undefined) {
                return [];
            }
            add((subtypeCode << 4) + e.channel); // subtype + channel
            switch (e.subtype) {
                case "noteOff": {
                    var ev = e;
                    add(ev.noteNumber);
                    add(ev.velocity);
                    break;
                }
                case "noteOn": {
                    var ev = e;
                    add(ev.noteNumber);
                    add(ev.velocity);
                    break;
                }
                case "noteAftertouch": {
                    var ev = e;
                    add(ev.noteNumber);
                    add(ev.amount);
                    break;
                }
                case "controller": {
                    var ev = e;
                    add(ev.controllerType);
                    add(ev.value);
                    break;
                }
                case "programChange":
                    add(e.value);
                    break;
                case "channelAftertouch":
                    add(e.amount);
                    break;
                case "pitchBend": {
                    var ev = e;
                    add(ev.value & 0x7f);
                    add((ev.value >> 7) & 0x7f);
                    break;
                }
                case "unknown":
                    add(e.data);
                    break;
                default:
                    break;
            }
            break;
        }
        default:
    }
    return bytes;
}

//https://sites.google.com/site/yyagisite/material/smfspec#format
function write(tracks, ticksPerBeat) {
    if (ticksPerBeat === void 0) { ticksPerBeat = 480; }
    var buf = new Buffer();
    // header chunk
    buf.writeChunk("MThd", function (it) {
        it.writeInt16(1); // formatType
        it.writeInt16(tracks.length); // trackCount
        it.writeInt16(ticksPerBeat); // timeDivision
    });
    var _loop_1 = function (track) {
        buf.writeChunk("MTrk", function (it) {
            for (var _i = 0, track_1 = track; _i < track_1.length; _i++) {
                var event = track_1[_i];
                it.writeBytes(serialize(event));
            }
        });
    };
    // track chunk
    for (var _i = 0, tracks_1 = tracks; _i < tracks_1.length; _i++) {
        var track = tracks_1[_i];
        _loop_1(track);
    }
    return buf.toBytes();
}

var MIDIControlEventNames = {
    "0": "Bank Select",
    "1": "Modulation",
    "2": "Breath Controller",
    "4": "Foot Pedal",
    "5": "Portamento Time",
    "6": "Data Entry",
    "7": "Volume",
    "8": "Balance",
    "10": "Pan",
    "11": "Expression",
    "12": "Effect Control 1",
    "13": "Effect Control 2",
    "14": "Undefined",
    "15": "Undefined",
    "16": "General Purpose Slider 1",
    "17": "General Purpose Slider 2",
    "18": "General Purpose Slider 3",
    "19": "Knob 2 General Purpose Slider 4",
    "20": "Knob 3",
    "21": "Knob 4",
    "32": "Bank Select",
    "33": "Modulation Wheel",
    "34": "Breath controller",
    "36": "Foot Pedal",
    "37": "Portamento Time",
    "38": "Data Entry",
    "39": "Volume",
    "40": "Balance",
    "42": "Pan position",
    "43": "Expression",
    "44": "Effect Control 1",
    "45": "Effect Control 2",
    "64": "Hold Pedal",
    "65": "Portamento",
    "66": "Sustenuto Pedal",
    "67": "Soft Pedal",
    "68": "Legato Pedal",
    "69": "Hold 2 Pedal",
    "70": "Sound Variation",
    "71": "Resonance",
    "72": "Sound Release Time",
    "73": "Sound Attack Time",
    "74": "Frequency Cutoff",
    "75": "Sound Control 6",
    "76": "Sound Control 7",
    "77": "Sound Control 8",
    "78": "Sound Control 9",
    "79": "Sound Control 10",
    "80": "Decay",
    "81": "High Pass Filter Frequency",
    "82": "General Purpose Button 3",
    "83": "General Purpose Button 4",
    "91": "Reverb Level",
    "92": "Tremolo Level",
    "93": "Chorus Level",
    "94": "Detune",
    "95": "Phaser Level",
    "96": "Data Button Increment",
    "97": "Data Button Decrement",
    "98": "NRPN (LSB)",
    "99": "NRPN (MSB)",
    "100": "RPN (LSB)",
    "101": "RPN (MSB)",
    "120": "All Sound Off",
    "121": "All Controllers Off",
    "122": "Local Keyboard",
    "123": "All Notes Off",
    "124": "Omni Mode Off",
    "125": "Omni Mode On",
    "126": "Mono Operation",
    "127": "Poly Operation"
};

var MIDIControlEvents = {
    MSB_BANK: 0x00,
    MSB_MODWHEEL: 0x01,
    MSB_BREATH: 0x02,
    MSB_FOOT: 0x04,
    MSB_PORTAMENTO_TIME: 0x05,
    MSB_DATA_ENTRY: 0x06,
    MSB_MAIN_VOLUME: 0x07,
    MSB_BALANCE: 0x08,
    MSB_PAN: 0x0a,
    MSB_EXPRESSION: 0x0b,
    MSB_EFFECT1: 0x0c,
    MSB_EFFECT2: 0x0d,
    MSB_GENERAL_PURPOSE1: 0x10,
    MSB_GENERAL_PURPOSE2: 0x11,
    MSB_GENERAL_PURPOSE3: 0x12,
    MSB_GENERAL_PURPOSE4: 0x13,
    LSB_BANK: 0x20,
    LSB_MODWHEEL: 0x21,
    LSB_BREATH: 0x22,
    LSB_FOOT: 0x24,
    LSB_PORTAMENTO_TIME: 0x25,
    LSB_DATA_ENTRY: 0x26,
    LSB_MAIN_VOLUME: 0x27,
    LSB_BALANCE: 0x28,
    LSB_PAN: 0x2a,
    LSB_EXPRESSION: 0x2b,
    LSB_EFFECT1: 0x2c,
    LSB_EFFECT2: 0x2d,
    LSB_GENERAL_PURPOSE1: 0x30,
    LSB_GENERAL_PURPOSE2: 0x31,
    LSB_GENERAL_PURPOSE3: 0x32,
    LSB_GENERAL_PURPOSE4: 0x33,
    SUSTAIN: 0x40,
    PORTAMENTO: 0x41,
    SOSTENUTO: 0x42,
    SUSTENUTO: 0x42,
    SOFT_PEDAL: 0x43,
    LEGATO_FOOTSWITCH: 0x44,
    HOLD2: 0x45,
    SC1_SOUND_VARIATION: 0x46,
    SC2_TIMBRE: 0x47,
    SC3_RELEASE_TIME: 0x48,
    SC4_ATTACK_TIME: 0x49,
    SC5_BRIGHTNESS: 0x4a,
    SC6: 0x4b,
    SC7: 0x4c,
    SC8: 0x4d,
    SC9: 0x4e,
    SC10: 0x4f,
    GENERAL_PURPOSE5: 0x50,
    GENERAL_PURPOSE6: 0x51,
    GENERAL_PURPOSE7: 0x52,
    GENERAL_PURPOSE8: 0x53,
    PORTAMENTO_CONTROL: 0x54,
    E1_REVERB_DEPTH: 0x5b,
    E2_TREMOLO_DEPTH: 0x5c,
    E3_CHORUS_DEPTH: 0x5d,
    E4_DETUNE_DEPTH: 0x5e,
    E5_PHASER_DEPTH: 0x5f,
    DATA_INCREMENT: 0x60,
    DATA_DECREMENT: 0x61,
    NONREG_PARM_NUM_LSB: 0x62,
    NONREG_PARM_NUM_MSB: 0x63,
    REGIST_PARM_NUM_LSB: 0x64,
    REGIST_PARM_NUM_MSB: 0x65,
    ALL_SOUNDS_OFF: 0x78,
    RESET_CONTROLLERS: 0x79,
    LOCAL_CONTROL_SWITCH: 0x7a,
    ALL_NOTES_OFF: 0x7b,
    OMNI_OFF: 0x7c,
    OMNI_ON: 0x7d,
    MONO1: 0x7e,
    MONO2: 0x7f,
};

var MIDIMetaEventNames = {
    0x00: "sequenceNumber",
    0x01: "text",
    0x02: "copyrightNotice",
    0x03: "trackName",
    0x04: "instrumentName",
    0x05: "lyrics",
    0x06: "marker",
    0x07: "cuePoint",
    0x20: "midiChannelPrefix",
    0x21: "portPrefix",
    0x2f: "endOfTrack",
    0x51: "setTempo",
    0x54: "smpteOffset",
    0x58: "timeSignature",
    0x59: "keySignature",
    0x7f: "sequencerSpecific"
};

exports.read = read;
exports.write = write;
exports.serialize = serialize;
exports.deserialize = deserialize;
exports.MIDIChannelEvents = MIDIChannelEvents;
exports.MIDIControlEventNames = MIDIControlEventNames;
exports.MIDIControlEvents = MIDIControlEvents;
exports.MIDIMetaEventNames = MIDIMetaEventNames;
exports.MIDIMetaEvents = MIDIMetaEvents;
//# sourceMappingURL=index.js.map
