import NoteTimeTransform from "../model/note-coord-transform.js"
const assert = require("assert")

describe("NoteTimeTransform", () => {
  const t = new NoteTimeTransform([
    { tempo: 120, time: 0 },
    { tempo: 150, time: 40 },
    { tempo: 240, time: 120 },
  ], 480)

  it("constructor", () => {
    assert(t != null)
  })
 
  it("getTempoAt", () => {
    assert.equal(t.getTempoAt(-999), 120)
    assert.equal(t.getTempoAt(0), 120)
    assert.equal(t.getTempoAt(10), 120)
    assert.equal(t.getTempoAt(40), 150)
    assert.equal(t.getTempoAt(60), 150)
    assert.equal(t.getTempoAt(999), 240)
  })

  it("getSeconds", () => {
    assert.equal(t.getSeconds(0), 0)
    assert.equal(t.getSeconds(0), 0)
  })
})
