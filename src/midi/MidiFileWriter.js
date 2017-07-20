import _ from "lodash"
import {
  addDeltaTime,
  eventToBytes,
  strToCharCodes
} from "../helpers/midiHelper"
import { deassemble } from "../helpers/noteAssembler"

//https://sites.google.com/site/yyagisite/material/smfspec#format

class Buffer {
  constructor() {
    this.data = []
  }

  get length() {
    return this.data.length
  }

  writeByte(v, pos) {
    if (pos) {
      this.data[pos] = v
    } else {
      this.data.push(v)
    }
  }

  writeStr(str) {
    this.writeBytes(strToCharCodes(str))
  }

  writeInt32(v, pos) {
    this.writeByte((v >> 24) & 0xff, pos)
    this.writeByte((v >> 16) & 0xff, pos + 1)
    this.writeByte((v >>  8) & 0xff, pos + 2)
    this.writeByte(v         & 0xff, pos + 3)
  }

  writeInt16(v, pos) {
    this.writeByte((v >>  8) & 0xff, pos)
    this.writeByte(v         & 0xff, pos + 1)
  }

  writeBytes(arr) {
    arr.forEach(v => this.writeByte(v))
  }

  writeChunk(id, func) {
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

export function write(tracks, ticksPerBeat = 480) {
  const buf = new Buffer()

  // header chunk
  buf.writeChunk("MThd", it => {
    it.writeInt16(1) // formatType
    it.writeInt16(tracks.length) // trackCount
    it.writeInt16(ticksPerBeat) // timeDivision
  })

  // track chunk
  for (const track of tracks) {
    buf.writeChunk("MTrk", it => {
      let events = addDeltaTime(_.flatten(track.getEvents().map(deassemble)))
      for (const event of events) {
        it.writeBytes(eventToBytes(event))
      }
    })
  }

  return buf.toBytes()
}
