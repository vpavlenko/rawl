import toCharCodes from "./toCharCodes"

export default class Buffer {
  data: number[] = []

  get length() {
    return this.data.length
  }

  writeByte(v: number, pos?: number) {
    if (pos) {
      this.data[pos] = v
    } else {
      this.data.push(v)
    }
  }

  writeStr(str: string) {
    this.writeBytes(toCharCodes(str))
  }

  writeInt32(v: number, pos: number = 0) {
    this.writeByte((v >> 24) & 0xff, pos)
    this.writeByte((v >> 16) & 0xff, pos + 1)
    this.writeByte((v >> 8) & 0xff, pos + 2)
    this.writeByte(v & 0xff, pos + 3)
  }

  writeInt16(v: number, pos: number = 0) {
    this.writeByte((v >> 8) & 0xff, pos)
    this.writeByte(v & 0xff, pos + 1)
  }

  writeBytes(arr: number[]) {
    arr.forEach(v => this.writeByte(v))
  }

  writeChunk(id: string, func: Function) {
    this.writeStr(id)
    const sizePos = this.length
    this.writeInt32(0) // dummy chunk size
    const start = this.length
    func(this) // write chunk contents
    const size = this.length - start
    this.writeInt32(size, sizePos) // write chunk size
  }

  toBytes() {
    return new Uint8Array(this.data)
  }
}
