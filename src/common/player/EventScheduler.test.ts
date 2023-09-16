import { filterEventsWithRange } from "../helpers/filterEvents"
import EventScheduler from "./EventScheduler"

describe("EventScheduler", () => {
  it("readNextEvents", () => {
    const events = [{ tick: 0 }, { tick: 100 }, { tick: 110 }]
    const s = new EventScheduler(
      (start, end) => filterEventsWithRange(events, start, end),
      () => [],
      0,
      480,
      100,
    )

    // 先読み時間分のイベントが入っている
    // There are events for read ahead time
    {
      const result = s.readNextEvents(120, 0)
      expect(result.length).toBe(1)
      expect(result[0].event).toBe(events[0])
    }

    // 前回から時間が経過してなければイベントはない
    // There is no event if time has passed since last time
    {
      const result = s.readNextEvents(120, 0)
      expect(result.length).toBe(0)
    }

    // 時間が経過すると2個目以降のイベントが返ってくる
    // If time has passed, the second or later events will come back
    {
      const result = s.readNextEvents(120, 120)
      expect(result.length).toBe(2)
      expect(result[0].event).toBe(events[1])
      expect(result[0].timestamp).toBe(120)
      expect(result[1].event).toBe(events[2])
      expect(result[1].timestamp).toBe(120)
    }
  })
})
