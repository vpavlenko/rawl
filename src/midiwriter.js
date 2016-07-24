(function() {
  "use strict"

//https://sites.google.com/site/yyagisite/material/smfspec#format

  function eventToBytes(e) {
    const bytes = []
    function add(data) {
      if (data instanceof Array) {
        bytes.pushArray(data)
      } else {
        bytes.push(data)
      }
    }

    add(MidiEvent.varIntBytes(e.deltaTime)
    add(e.type == "meta" ? 0xff : 0)

    if (e.type == "meta") {
      add(MIDIMetaEventType[e.subtype])

    } else {

    }

    return bytes
  }

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
      for (const i = 0, i < str.length; i++) {
        this.write(str.charCodeAt(i))
      }
    }

    writeInt32(v, pos) {

    }

    writeInt16(v, pos) {

    }

    writeBytes(arr) {
      arr.forEach(v => this.writeByte(v))
    }

    writeChunk(id, func) {
      this.writeStr(id)
      const start = this.length
      this.writeInt32(0) // dummy chunk size
      func(this) // write chunk contents
      const size = this.length - start
      this.writeInt32(size, start) // write chunk size
    }

    toBytes() {
      return new Uint8Array(this.data)
    }
  }

  class MidiWriter {
    write(tracks, ticksPerBeat = 480) {
      const tracks = [{events: []}]
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
          for (const event of events) {
            it.writeBytes(eventToBytes(event))
          }
        })
      }

      return buf.toBytes()
    }
  }

  const root = 
    typeof global == "object" ? global :
    typeof self == "object" ? self : this

  root.MidiWriter = MidiWriter
})()
