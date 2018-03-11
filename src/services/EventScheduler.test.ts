import assert from "assert"
import EventScheduler from "./EventScheduler"

describe("EventScheduler", () => {
  it("readNextEvents", () => {
    const events = [
      { tick: 0 },
      { tick: 100 },
      { tick: 110 }
    ]
    const s = new EventScheduler(events, 0, 480, 100)

    // 先読み時間分のイベントが入っている
    {
      const result = s.readNextEvents(120, 0)
      assert.equal(result.length, 1)
      assert.equal(result[0].event, events[0])
    }

    // 前回から時間が経過してなければイベントはない
    {
      const result = s.readNextEvents(120, 0)
      assert.equal(result.length, 0)
    }

    // 時間が経過すると2個目以降のイベントが返ってくる
    {
      const result = s.readNextEvents(120, 120)
      assert.equal(result.length, 2)
      assert.equal(result[0].event, events[1])
      assert.equal(result[0].timestamp, 120)
      assert.equal(result[1].event, events[2])
      assert.equal(result[1].timestamp, 120)
    }
  })
})
