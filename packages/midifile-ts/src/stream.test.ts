import assert from "assert"
import Stream from "./stream"
import fs from "fs"

describe("Stream", () => {
  const data = fs.readFileSync("./fixtures/tracks.mid")
  it("readStr", () => {
    const s = new Stream(data)
    assert.equal(s.readStr(4), "MThd")
  })
  it("read", () => {
    const s = new Stream(data)
    assert.deepEqual(
      s.read(4).toJSON().data,
      "MThd".split("").map(s => s.charCodeAt(0))
    )
  })
  it("readInt8", () => {
    const s = new Stream(data)
    assert.equal(String.fromCharCode(s.readInt8()), "M")
    assert.equal(String.fromCharCode(s.readInt8()), "T")
    assert.equal(String.fromCharCode(s.readInt8()), "h")
    assert.equal(String.fromCharCode(s.readInt8()), "d")
  })
  it("readInt16", () => {
    const s = new Stream(data)
    assert.equal(s.readInt16(), 19796)
  })
  it("readInt32", () => {
    const s = new Stream(data)
    assert.equal(s.readInt32(), 1297377380)
  })
})
