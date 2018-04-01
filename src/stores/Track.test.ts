import assert from "assert"
import { serialize, deserialize } from "serializr"

import Track from "./Track"

describe("Track", () => {
  it("should be serializable", () => {
    const track = new Track()
    track.channel = 5
    track.addEvent({
      tick: 123
    })
    const s = serialize(track)
    const t = deserialize(Track, s)
    assert.equal(t.channel, 5)
    assert.equal(t.endOfTrack, track.endOfTrack)
    assert.equal(t.events.length, 1)
    assert.equal(t.events[0].tick, 123)
  })
})
