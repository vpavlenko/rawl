(function() {
  "use strict"
  //https://sites.google.com/site/yyagisite/material/smfspec#format

  function varIntBytes(v) {
    const r = []
    let x = v
    while(true) {
      const s = x & 0x7f
      x >>= 7
      if (x == 0) {
        r.push(s)
        break
      } else {
        r.push(s + (1 << 7))
      }
    }
    return r
  }

  function strToCharCodes(str) {
    const bytes = []
    for (let i = 0; i < str.length; i++) {
      bytes.push(str.charCodeAt(i))
    }
    return bytes
  }

  function eventToBytes(e) {
    const bytes = []
    function add(data) {
      if (data instanceof Array) {
        bytes.pushArray(data)
      } else {
        bytes.push(data)
      }
    }

    add(varIntBytes(e.deltaTime))

    switch (e.type) {
      case "meta":
        add(0xff) // type
        add(MIDIMetaEventType[e.subtype]) // subtype
        switch(e.subtype) {
          case "text":
          case "copyrightNotice":
          case "trackName":
          case "instrumentName":
          case "lyrics":
          case "cuePoint":
            add(e.value.length)
            add(strToCharCodes(e.value))
            break
          case "midiChannelPrefix":
            add(1)
            add(e.value)
            break
          case "endOfTrack":
            break
          case "setTempo":
            add(3) // data length
            add((e.value >> 16) & 0x7f)
            add((e.value >> 8) & 0x7f)
            add(e.value & 0x7f)
            break
          case "timeSignature":
            add(4)
            add(e.numerator)
            add(Math.log2(e.denominator))
            add(e.metronome)
            add(e.thirtyseconds)
            break
          case "keySignature":
            add(2)
            add(e.key)
            add(e.scale)
            break
          case "sequencerSpecific":
          case "unknown":
            add(e.value.length)
            add(e.value)
            break
        }
        break
      case "sysEx":
        add(0xf0)
        add(e.data.length)
        add(e.data)
        break
      case "dividedSysEx":
        add(0xf7)
        add(e.data.length)
        add(e.data)
        break
      case "channel":
        add(MIDIChannelEventType[e.subtype] << 4 + e.channel) // subtype + channel
        switch(e.subtype) {
          case "noteOff":
          case "noteOn":
            add(e.noteNumber)
            add(e.velocity)
            break
          case "noteAftertouch":
            add(e.noteNumber)
            add(e.amount)
            break
          case "controller":
            add(e.controllerType)
            add(e.value)
            break
          case "programChange":
            add(e.value)
            break
          case "channelAftertouch":
            add(e.amount)
            break
          case "pitchBend":
            add((e.value >> 7) & 0x7f)
            add(e.value & 0x7f)
            break
          case "unknown":
            add(e.value)
            break
        }
        break
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
      this.writeBytes(strToCharCodes(str))
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
    static write(tracks, ticksPerBeat = 480) {
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
          for (const event of track.getEvents()) {
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
