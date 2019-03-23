import toCharCodes from "./toCharCodes";
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
export default Buffer;
//# sourceMappingURL=buffer.js.map