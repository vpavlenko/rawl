import { filterEventsOverlapRange, filterEventsWithRange } from "./filterEvents"

describe("filterEvents", () => {
  const events = [
    { tick: 0 },
    { tick: 5, duration: 5 },
    { tick: 5, duration: 6 },
    { tick: 5, duration: 100 },
    { tick: 10 },
    { tick: 20 },
    { tick: 50 },
  ]

  describe("filterEventsWithRange", () => {
    it("should contain the event placed at the start tick but the end tick", () => {
      expect(filterEventsWithRange(events, 10, 50)).toStrictEqual([
        { tick: 10 },
        { tick: 20 },
      ])
    })
  })

  describe("filterEventsWithinView", () => {
    it("should contain events with duration", () => {
      expect(filterEventsOverlapRange(events, 10, 50)).toStrictEqual([
        { tick: 5, duration: 6 },
        { tick: 5, duration: 100 },
        { tick: 10 },
        { tick: 20 },
      ])
    })
  })
})
