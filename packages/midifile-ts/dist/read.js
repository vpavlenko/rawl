import Stream from "./stream";
import deserialize from "./deserialize";
/*
class to parse the .mid file format
(depends on stream.js)
*/
export default function read(data) {
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
        return deserialize(stream, lastEventTypeByte, function (byte) { return (lastEventTypeByte = byte); });
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
//# sourceMappingURL=read.js.map