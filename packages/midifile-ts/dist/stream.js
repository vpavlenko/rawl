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
        var result = (this.readByte() << 24) +
            (this.readByte() << 16) +
            (this.readByte() << 8) +
            this.readByte();
        return result;
    };
    /* read a big-endian 16-bit integer */
    Stream.prototype.readInt16 = function () {
        var result = (this.readByte() << 8) + this.readByte();
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
                result += b & 0x7f;
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
export default Stream;
//# sourceMappingURL=stream.js.map