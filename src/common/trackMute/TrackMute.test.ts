import assert from "assert"
import TrackMute from "./TrackMute"

describe("TrackMute", () => {
  it("not muted by default", () => {
    const t = new TrackMute()
    assert.equal(t.isMuted(0), false)
    assert.equal(t.isMuted(100), false)
  })

  it("mute", () => {
    const t = new TrackMute()
    assert.equal(t.isMuted(0), false)
    t.mute(0)
    assert.equal(t.isMuted(0), true)
    assert.equal(t.shouldPlayTrack(0), false)
    t.unmute(0)
    assert.equal(t.isMuted(0), false)
  })

  it("solo", () => {
    const t = new TrackMute()
    assert.equal(t.isSolo(0), false)
    t.solo(0)
    assert.equal(t.isSolo(0), true)
    assert.equal(t.isSoloMode(), true)
    assert.equal(t.isMuted(1), true)
    assert.equal(t.shouldPlayTrack(0), true)
    assert.equal(t.shouldPlayTrack(1), false)
    t.solo(1)
    assert.equal(t.isSolo(0), true)
    assert.equal(t.isSolo(1), true)
    assert.equal(t.isSoloMode(), true)
    assert.equal(t.isMuted(0), false)
    assert.equal(t.isMuted(1), false)
    assert.equal(t.isMuted(2), true)
    assert.equal(t.shouldPlayTrack(0), true)
    assert.equal(t.shouldPlayTrack(1), true)
    assert.equal(t.shouldPlayTrack(2), false)
    t.unsolo(0)
    assert.equal(t.isSolo(0), false)
    assert.equal(t.isSoloMode(), true)
    t.unsolo(1)
    assert.equal(t.isSolo(1), false)
    assert.equal(t.isSoloMode(), false)
  })
})
