export type StreamSource = DataView | number[] | ArrayBuffer | Buffer

/* Wrapper for accessing strings through sequential reads */
export default class Stream {
  private buf: DataView
  private position = 0

  constructor(buf: StreamSource) {
    if (buf instanceof DataView) {
      this.buf = buf
    } else if (buf instanceof ArrayBuffer) {
      this.buf = new DataView(buf)
    } else if (buf instanceof Buffer) {
      this.buf = new DataView(buf.buffer)
    } else if (buf instanceof Array) {
      this.buf = new DataView(new Uint8Array(buf).buffer)
    }
  }

  readByte() {
    return this.buf.getUint8(this.position++)
  }

  readStr(length: number): string {
    return this.read(length)
      .map(e => String.fromCharCode(e))
      .join("")
  }

  read(length: number): number[] {
    const result: number[] = []
    for (let index = 0; index < length; index++) {
      result.push(this.readByte())
    }
    return result
  }

  /* read a big-endian 32-bit integer */
  readInt32(): number {
    const result = this.buf.getInt32(this.position, false)
    this.position += 4
    return result
  }

  /* read a big-endian 16-bit integer */
  readInt16(): number {
    const result = this.buf.getInt16(this.position, false)
    this.position += 2
    return result
  }

  /* read an 8-bit integer */
  readInt8(signed = false): number {
    if (signed) {
      return this.buf.getInt8(this.position++)
    } else {
      return this.readByte()
    }
  }

  eof(): boolean {
    return this.position >= this.buf.byteLength
  }

  /* read a MIDI-style variable-length integer
    (big-endian value in groups of 7 bits,
    with top bit set to signify that another byte follows)
  */
  readVarInt(): number {
    let result = 0
    for (;;) {
      const b = this.readInt8()
      if (b & 0x80) {
        result += b & 0x7f
        result <<= 7
      } else {
        /* b is the last byte */
        return result + b
      }
    }
  }
}
