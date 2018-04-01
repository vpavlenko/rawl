import assert from "assert"
import { assemble, deassemble } from "./noteAssembler"

function createNote(noteNumber, tick, duration, velocity, channel) {
  return {
    type: "channel",
    subtype: "note",
    noteNumber,
    tick,
    velocity,
    duration,
    channel
  }
}

describe("deassemble", () => {
  it("should deassemble to two notes", () => {
    const note = createNote(32, 100, 60, 50, 3)
    const result = deassemble(note)
    assert.equal(result.length, 2)
    assert.deepEqual(result[0], {
      type: "channel",
      subtype: "noteOn",
      noteNumber: 32,
      tick: 100,
      velocity: 50,
      channel: 3
    })
    assert.deepEqual(result[1], {
      type: "channel",
      subtype: "noteOff",
      noteNumber: 32,
      tick: 100 + 60 - 1,
      velocity: 0,
      channel: 3
    })
  })
})

describe("assemble", () => {
  it("should assemble to an note", () => {
    const notes = [{
      type: "channel",
      subtype: "noteOn",
      noteNumber: 14,
      tick: 93,
      velocity: 120,
      channel: 5
    }, {
      type: "channel",
      subtype: "noteOff",
      noteNumber: 14,
      tick: 193,
      velocity: 0,
      channel: 5
    }]
    const result = assemble(notes)
    assert.equal(result.length, 1)
    assert.deepEqual(result[0], {
      type: "channel",
      subtype: "note",
      noteNumber: 14,
      tick: 93,
      velocity: 120,
      channel: 5,
      duration: 100
    })
  })
})
