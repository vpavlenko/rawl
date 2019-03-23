import { toVLQ } from "./vlq";
import toCharCodes from "./toCharCodes";
import MIDIChannelEvents from "./constants/MIDIChannelEvents";
import MIDIMetaEvents from "./constants/MIDIMetaEvents";
export default function serialize(e, includeDeltaTime) {
    if (includeDeltaTime === void 0) { includeDeltaTime = true; }
    var bytes = [];
    function add(data) {
        if (Array.isArray(data)) {
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
        add(toVLQ(e.deltaTime));
    }
    function addNumbers(list) {
        add(list.length);
        list.forEach(function (v) { return add(v); });
    }
    function addText(text) {
        add(text.length);
        add(toCharCodes(text));
    }
    switch (e.type) {
        case "meta": {
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
                    addNumbers([(t >> 16) & 0xff, (t >> 8) & 0xff, t & 0xff]);
                    break;
                }
                case "timeSignature": {
                    addNumbers([
                        e.numerator,
                        Math.log2(e.denominator),
                        e.metronome,
                        e.thirtyseconds
                    ]);
                    break;
                }
                case "keySignature": {
                    addNumbers([e.key, e.scale]);
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
            addNumbers(e.data);
            break;
        case "dividedSysEx":
            add(0xf7);
            addNumbers(e.data);
            break;
        case "channel": {
            var subtypeCode = MIDIChannelEvents[e.subtype];
            if (subtypeCode === undefined) {
                return [];
            }
            add((subtypeCode << 4) + e.channel); // subtype + channel
            switch (e.subtype) {
                case "noteOff": {
                    add(e.noteNumber);
                    add(e.velocity);
                    break;
                }
                case "noteOn": {
                    add(e.noteNumber);
                    add(e.velocity);
                    break;
                }
                case "noteAftertouch": {
                    add(e.noteNumber);
                    add(e.amount);
                    break;
                }
                case "controller": {
                    add(e.controllerType);
                    add(e.value);
                    break;
                }
                case "programChange":
                    add(e.value);
                    break;
                case "channelAftertouch":
                    add(e.amount);
                    break;
                case "pitchBend": {
                    add(e.value & 0x7f);
                    add((e.value >> 7) & 0x7f);
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
//# sourceMappingURL=serialize.js.map