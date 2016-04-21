import NoteCoordConverter from "../note-coord-converter.js"
const assert = require("assert")

describe("NoteCoordConverter", () => {
  const c = new NoteCoordConverter(100, 30, [
    { tempo: 120, time: 0 },
    { tempo: 150, time: 40 },
    { tempo: 240, time: 120 },
  ], 480)

  it("constructor", () => {
    assert(c != null)
  })
 
  it("getTempoAtTime", () => {
    assert.equal(c.getTempoAtTime(-999), 120)
    assert.equal(c.getTempoAtTime(0), 120)
    assert.equal(c.getTempoAtTime(10), 120)
    assert.equal(c.getTempoAtTime(40), 150)
    assert.equal(c.getTempoAtTime(60), 150)
    assert.equal(c.getTempoAtTime(999), 240)
  })

  it("getSecondsAtTime", () => {
    assert.equal(c.getSecondsAtTime(0), 0)
    assert.equal(c.getSecondsAtTime(0), 0)
  })
})
