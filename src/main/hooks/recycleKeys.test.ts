import uniq from "lodash/uniq"
import testData from "../../../testdata/recycleKeyInput.json"
import { recycleKeys } from "./recycleKeys"

describe("recycleKeys", () => {
  it("should use id as key at first", () => {
    const result = recycleKeys([], [{ id: 0 }, { id: 1 }])
    expect(result).toStrictEqual([
      { key: 0, value: { id: 0 } },
      { key: 1, value: { id: 1 } },
    ])
  })

  it("not changed", () => {
    const result = recycleKeys(
      [
        { key: 0, value: { id: 0 } },
        { key: 1, value: { id: 1 } },
      ],
      [{ id: 0 }, { id: 1 }]
    )
    expect(result).toStrictEqual([
      { key: 0, value: { id: 0 } },
      { key: 1, value: { id: 1 } },
    ])
  })

  it("reuse keys", () => {
    const result = recycleKeys(
      [
        { key: 0, value: { id: 0 } },
        { key: 1, value: { id: 1 } },
      ],
      [{ id: 1 }, { id: 2 }]
    )
    expect(result).toStrictEqual([
      { key: 1, value: { id: 1 } },
      { key: 0, value: { id: 2 } },
    ])
  })

  it("reuse keys and create new keys", () => {
    const result = recycleKeys(
      [
        { key: 0, value: { id: 0 } },
        { key: 1, value: { id: 1 } },
      ],
      [{ id: 1 }, { id: 2 }, { id: 3 }]
    )
    expect(result).toStrictEqual([
      { key: 1, value: { id: 1 } },
      { key: 0, value: { id: 2 } },
      { key: 2, value: { id: 3 } },
    ])
  })

  it("create new keys if conflict", () => {
    const result = recycleKeys(
      [
        { key: 0, value: { id: 0 } },
        { key: 3, value: { id: 1 } },
      ],
      [{ id: 1 }, { id: 2 }, { id: 3 }]
    )
    expect(result).toStrictEqual([
      { key: 3, value: { id: 1 } },
      { key: 0, value: { id: 2 } },
      { key: 4, value: { id: 3 } },
    ])
  })

  it("remove keys when items removed", () => {
    const result = recycleKeys(
      [
        { key: 0, value: { id: 1 } },
        { key: 1, value: { id: 2 } },
        { key: 2, value: { id: 3 } },
        { key: 3, value: { id: 4 } },
        { key: 4, value: { id: 5 } },
      ],
      [{ id: 1 }, { id: 3 }]
    )
    expect(result).toStrictEqual([
      { key: 0, value: { id: 1 } },
      { key: 2, value: { id: 3 } },
    ])
  })

  it("wont produce same keys", () => {
    const { prevItems, items } = testData
    const ids = items.map((e) => e.id)
    expect(ids).toStrictEqual(uniq(ids))
    const keyedValue = recycleKeys(prevItems, items)
    const keys = keyedValue.map((e) => e.key)
    expect(keys).toStrictEqual(uniq(keys))
  })
})
