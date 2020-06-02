import NoteCoordTransform from "./NoteCoordTransform"

describe("NoteCoordTransform", () => {
  const t = new NoteCoordTransform(100, 30, 127)

  it("constructor", () => {
    expect(t).not.toBeNull()
  })

  it("getX", () => {
    expect(t.getX(0)).toBe(0)
    expect(t.getX(1)).toBe(100)
  })

  it("getY", () => {
    expect(t.getY(127)).toBe(0)
    expect(t.getY(0)).toBe(30 * 127)
  })
})
