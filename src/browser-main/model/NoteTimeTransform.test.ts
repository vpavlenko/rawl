import assert from "assert"
import NoteTimeTransform from "./NoteTimeTransform"

describe("NoteTimeTransform", () => {
  const t = new NoteTimeTransform([
    { tempo: 120, tick: 0 },
    { tempo: 150, tick: 40 },
    { tempo: 240, tick: 120 },
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
