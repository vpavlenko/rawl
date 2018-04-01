/* Wrapper for accessing strings through sequential reads */
export default function Stream(buf) {
  let position = 0

  function readByte() {
    const result = buf[position]
    position++
    return result
  }

  function readStr(length) {
    return read(length).toString()
  }

  function read(length) {
    const result = buf.slice(position, position + length)
    position += length
    return result
  }

  /* read a big-endian 32-bit integer */
  function readInt32() {
    const result =
      (readByte() << 24)
      + (readByte() << 16)
      + (readByte() << 8)
      + readByte()
    return result
  }

  /* read a big-endian 16-bit integer */
  function readInt16() {
    var result =
      (readByte() << 8)
      + readByte()
    return result
  }

  /* read an 8-bit integer */
  function readInt8(signed = false) {
    let result = readByte()
    if (signed && result > 127) result -= 256
    return result
  }

  function eof() {
    return position >= buf.length
  }

  /* read a MIDI-style variable-length integer
    (big-endian value in groups of 7 bits,
    with top bit set to signify that another byte follows)
  */
  function readVarInt() {
    let result = 0
    for (;;) {
      const b = readInt8()
      if (b & 0x80) {
        result += (b & 0x7f)
        result <<= 7
      } else {
        /* b is the last byte */
        return result + b
      }
    }
  }

  return {
    eof,
    read,
    readInt32,
    readInt16,
    readInt8,
    readVarInt,
    readStr
  }
}
