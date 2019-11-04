import assert from "assert"
import NoteCoordTransform from "./NoteCoordTransform"

describe("NoteCoordTransform", () => {
  const t = new NoteCoordTransform(100, 30, 127)

  it("constructor", () => {
    assert(t !== null)
  })

  it("getX", () => {
    assert.equal(t.getX(0), 0)
    assert.equal(t.getX(1), 100)
  })

  it("getY", () => {
    assert.equal(t.getY(127), 0)
    assert.equal(t.getY(0), 30 * 127)
  })
})
