import Buffer from "./buffer";
import serialize from "./serialize";
//https://sites.google.com/site/yyagisite/material/smfspec#format
export default function write(tracks, ticksPerBeat) {
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
//# sourceMappingURL=write.js.map