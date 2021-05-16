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
      dataLSB: 4,
    }
    const result = deassemble(event, (x) => x)
    expect(result.length).toBe(4)
    expect(result[0]).toStrictEqual({
      type: "channel",
      subtype: "controller",
      controllerType: 101,
      deltaTime: 100,
      channel: 1,
      value: 1,
    })
    expect(result[1]).toStrictEqual({
      type: "channel",
      subtype: "controller",
      controllerType: 100,
      deltaTime: 0,
      channel: 1,
      value: 2,
    })
    expect(result[2]).toStrictEqual({
      type: "channel",
      subtype: "controller",
      controllerType: 6,
      deltaTime: 0,
      channel: 1,
      value: 3,
    })
    expect(result[3]).toStrictEqual({
      type: "channel",
      subtype: "controller",
      controllerType: 38,
      deltaTime: 0,
      channel: 1,
      value: 4,
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
        value: 1,
      },
      {
        type: "channel",
        subtype: "controller",
        controllerType: 100,
        deltaTime: 0,
        tick: 200,
        channel: 1,
        value: 2,
      },
      {
        type: "channel",
        subtype: "controller",
        controllerType: 6,
        deltaTime: 0,
        tick: 200,
        channel: 1,
        value: 3,
      },
      {
        type: "channel",
        subtype: "controller",
        controllerType: 38,
        deltaTime: 0,
        tick: 200,
        channel: 1,
        value: 4,
      },
    ]
    const result = assemble(events)
    expect(result.length).toBe(1)
    expect(result[0]).toStrictEqual({
      type: "channel",
      subtype: "rpn",
      channel: 1,
      deltaTime: 100,
      rpnMSB: 1,
      rpnLSB: 2,
      dataMSB: 3,
      dataLSB: 4,
    })
  })
})
