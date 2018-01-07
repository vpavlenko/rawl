import assert from "assert"
import { assemble, deassemble } from "./RPNAssembler"

describe("deassemble", () => {
  it("should deassemble RPN", () => {
    const event = {
      channel: 1,
      type: "channel",
      subtype: "rpn",
      tick: 200,
      deltaTime: 100,
      rpnMSB: 1,
      rpnLSB: 2,
      dataMSB: 3,
      dataLSB: 4
    }
    const result = deassemble(event)
    assert.equal(result.length, 4)
    assert.deepEqual(result[0], {
      type: "channel",
      subtype: "controller",
      controllerType: 101,
      deltaTime: 100,
      tick: 200,
      channel: 1,
      value: 1
    })
    assert.deepEqual(result[1], {
      type: "channel",
      subtype: "controller",
      controllerType: 100,
      deltaTime: 0,
      tick: 200,
      channel: 1,
      value: 2
    })
    assert.deepEqual(result[2], {
      type: "channel",
      subtype: "controller",
      controllerType: 6,
      deltaTime: 0,
      tick: 200,
      channel: 1,
      value: 3
    })
    assert.deepEqual(result[3], {
      type: "channel",
      subtype: "controller",
      controllerType: 38,
      deltaTime: 0,
      tick: 200,
      channel: 1,
      value: 4
    })
  })
})

describe("assemble", () => {
  it("should assemble to RPN", () => {
    const events = [
      {
        type: "channel",
        subtype: "controller",
        controllerType: 101,
        deltaTime: 100,
        tick: 200,
        channel: 1,
        value: 1
      },
      {
        type: "channel",
        subtype: "controller",
        controllerType: 100,
        deltaTime: 0,
        tick: 200,
        channel: 1,
        value: 2
      },
      {
        type: "channel",
        subtype: "controller",
        controllerType: 6,
        deltaTime: 0,
        tick: 200,
        channel: 1,
        value: 3
      },
      {
        type: "channel",
        subtype: "controller",
        controllerType: 38,
        deltaTime: 0,
        tick: 200,
        channel: 1,
        value: 4
      }
    ]
    const result = assemble(events)
    assert.equal(result.length, 1)
    assert.deepEqual(result[0], {
      type: "channel",
      subtype: "rpn",
      channel: 1,
      deltaTime: 100,
      tick: 200,
      rpnMSB: 1,
      rpnLSB: 2,
      dataMSB: 3,
      dataLSB: 4,
    })
  })
})
