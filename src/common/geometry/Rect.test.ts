import { intersects } from "."

describe("Rect", () => {
  describe("intersects", () => {
    it("included", () => {
      expect(
        intersects(
          {
            x: 1,
            y: 1,
            width: 10,
            height: 10,
          },
          {
            x: 2,
            y: 2,
            width: 1,
            height: 1,
          },
        ),
      ).toBeTruthy()

      expect(
        intersects(
          {
            x: 1,
            y: 1,
            width: 10,
            height: 10,
          },
          {
            x: 1,
            y: 1,
            width: 1,
            height: 1,
          },
        ),
      ).toBeTruthy()
    })

    it("overlapped", () => {
      expect(
        intersects(
          {
            x: 1,
            y: 1,
            width: 2,
            height: 2,
          },
          {
            x: 2,
            y: 2,
            width: 1,
            height: 1,
          },
        ),
      ).toBeTruthy()
    })

    it("separated", () => {
      expect(
        intersects(
          {
            x: 0,
            y: 0,
            width: 1,
            height: 1,
          },
          {
            x: 2,
            y: 2,
            width: 1,
            height: 1,
          },
        ),
      ).toBeFalsy()
    })

    it("adjacent", () => {
      expect(
        intersects(
          {
            x: 1,
            y: 1,
            width: 1,
            height: 1,
          },
          {
            x: 2,
            y: 2,
            width: 1,
            height: 1,
          },
        ),
      ).toBeFalsy()
    })

    it("zero", () => {
      expect(
        intersects(
          {
            x: 1,
            y: 1,
            width: 0,
            height: 0,
          },
          {
            x: 1,
            y: 1,
            width: 0,
            height: 0,
          },
        ),
      ).toBeFalsy()
    })
  })
})
