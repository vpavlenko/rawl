import _ from "lodash"
import Buffer from "./buffer"
import serialize from "./serialize"

//https://sites.google.com/site/yyagisite/material/smfspec#format

export default function write(tracks, ticksPerBeat = 480) {
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
      for (const event of track.events) {
        it.writeBytes(serialize(event))
      }
    })
  }

  return buf.toBytes()
}
