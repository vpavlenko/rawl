export interface Data<T> extends Iterable<T> {
  [key: number]: T
  slice(start?: T, end?: T): this
  readonly length: number
}

/* Wrapper for accessing strings through sequential reads */
export default class Stream<T extends Data<number>> {
  private buf: T
  private position = 0

  constructor(buf: T) {
    this.buf = buf
  }

  readByte() {
    const result = this.buf[this.position]
    this.position++
    return result
  }

  readStr(length: number): string {
    const data = this.read(length)
    const chars: String[] = []
    for (let index = 0; index < data.length; index++) {
      const element = data[index]
      chars.push(String.fromCharCode(element))
    }
    return chars.join("")
  }

  read(length: number): T {
    const result = this.buf.slice(this.position, this.position + length)
    this.position += length
    return result
  }

  /* read a big-endian 32-bit integer */
  readInt32(): number {
    const result =
      (this.readByte() << 24) +
      (this.readByte() << 16) +
      (this.readByte() << 8) +
      this.readByte()
    return result
  }

  /* read a big-endian 16-bit integer */
  readInt16(): number {
    var result = (this.readByte() << 8) + this.readByte()
    return result
  }

  /* read an 8-bit integer */
  readInt8(signed = false): number {
    let result = this.readByte()
    if (signed && result > 127) result -= 256
    return result
  }

  eof(): boolean {
    return this.position >= this.buf.length
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
