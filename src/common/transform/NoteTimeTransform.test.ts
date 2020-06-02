import NoteTimeTransform from "./NoteTimeTransform"

describe("NoteTimeTransform", () => {
  const t = new NoteTimeTransform(
    [
      { tempo: 120, tick: 0 },
      { tempo: 150, tick: 40 },
      { tempo: 240, tick: 120 }
    ],
    480
  )

  it("constructor", () => {
    expect(t).not.toBeNull()
  })

  it("getTempoAt", () => {
    expect(t.getTempoAt(-999)).toBe(120)
    expect(t.getTempoAt(0)).toBe(120)
    expect(t.getTempoAt(10)).toBe(120)
    expect(t.getTempoAt(40)).toBe(150)
    expect(t.getTempoAt(60)).toBe(150)
    expect(t.getTempoAt(999)).toBe(240)
  })

  it("getSeconds", () => {
    expect(t.getSeconds(0)).toBe(0)
    expect(t.getSeconds(0)).toBe(0)
  })
})
